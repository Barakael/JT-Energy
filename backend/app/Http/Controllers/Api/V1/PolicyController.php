<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use App\Models\PolicyRecipient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PolicyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('hr_admin')) {
            $policies = Policy::with('creator:id,name')
                ->withCount('recipients')
                ->latest()
                ->paginate(20);
        } else {
            $policies = Policy::visibleTo($user->id)
                ->with('creator:id,name')
                ->latest()
                ->paginate(20);

            // Attach read status for the current user
            $policyIds = $policies->pluck('id');
            $readMap = PolicyRecipient::where('user_id', $user->id)
                ->whereIn('policy_id', $policyIds)
                ->whereNotNull('read_at')
                ->pluck('policy_id')
                ->flip()
                ->toArray();

            $policies->getCollection()->transform(function ($policy) use ($readMap) {
                $policy->is_read = isset($readMap[$policy->id]);
                return $policy;
            });
        }

        return response()->json($policies);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'type'          => 'required|in:Policy,Rule,Announcement,Instruction',
            'priority'      => 'required|in:Normal,Important,Urgent',
            'target_type'   => 'required|in:All,Selected',
            'recipient_ids'   => 'required_if:target_type,Selected|array',
            'recipient_ids.*' => 'exists:users,id',
            'publish'       => 'nullable|boolean',
        ]);

        $policy = Policy::create([
            'title'        => $data['title'],
            'content'      => $data['content'],
            'type'         => $data['type'],
            'priority'     => $data['priority'],
            'target_type'  => $data['target_type'],
            'created_by'   => $request->user()->id,
            'published_at' => ($data['publish'] ?? true) ? now() : null,
        ]);

        // Create recipient records for selected targeting
        if ($data['target_type'] === 'Selected' && !empty($data['recipient_ids'])) {
            foreach ($data['recipient_ids'] as $userId) {
                PolicyRecipient::create([
                    'policy_id' => $policy->id,
                    'user_id'   => $userId,
                ]);
            }
        }

        return response()->json($policy->load('creator:id,name'), 201);
    }

    public function update(Request $request, Policy $policy): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'nullable|string|max:255',
            'content'     => 'nullable|string',
            'type'        => 'nullable|in:Policy,Rule,Announcement,Instruction',
            'priority'    => 'nullable|in:Normal,Important,Urgent',
            'publish'     => 'nullable|boolean',
        ]);

        if (isset($data['publish'])) {
            $data['published_at'] = $data['publish'] ? now() : null;
            unset($data['publish']);
        }

        $policy->update($data);

        return response()->json($policy->load('creator:id,name'));
    }

    public function destroy(Policy $policy): JsonResponse
    {
        $policy->delete();
        return response()->json(['message' => 'Policy deleted']);
    }

    /**
     * Mark a policy as read by the current user.
     */
    public function markRead(Request $request, Policy $policy): JsonResponse
    {
        PolicyRecipient::updateOrCreate(
            ['policy_id' => $policy->id, 'user_id' => $request->user()->id],
            ['read_at' => now()]
        );

        return response()->json(['message' => 'Marked as read']);
    }
}
