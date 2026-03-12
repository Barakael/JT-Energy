<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use App\Models\PolicyRecipient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get unread policies/notifications for the current user.
     */
    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        // Get the last 3 published policies visible to this user (read or unread)
        $policies = Policy::visibleTo($userId)
            ->latest('published_at')
            ->take(3)
            ->get();

        $readPolicyIds = PolicyRecipient::where('user_id', $userId)
            ->whereNotNull('read_at')
            ->pluck('policy_id')
            ->toArray();

        $items = $policies->values()->map(fn ($p) => [
            'id'           => $p->id,
            'title'        => $p->title,
            'type'         => $p->type,
            'priority'     => $p->priority,
            'published_at' => $p->published_at?->toDateTimeString(),
            'excerpt'      => \Illuminate\Support\Str::limit(strip_tags($p->content), 100),
            'is_read'      => in_array($p->id, $readPolicyIds),
        ]);

        return response()->json($items);
    }

    /**
     * Get count of unread notifications.
     */
    public function count(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        $totalVisible = Policy::visibleTo($userId)->count();
        $readCount = PolicyRecipient::where('user_id', $userId)
            ->whereNotNull('read_at')
            ->whereIn('policy_id', Policy::visibleTo($userId)->select('id'))
            ->count();

        return response()->json(['count' => max(0, $totalVisible - $readCount)]);
    }
}
