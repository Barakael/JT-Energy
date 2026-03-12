<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employees = User::with('profile.department')
            ->whereHas('roles', fn($q) => $q->where('name', 'employee'))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")
                ->orWhereHas('profile.department', fn($dq) => $dq->where('name', 'like', "%$s%")))
            ->paginate(20);

        return response()->json(UserResource::collection($employees)->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'nullable|string|min:8',
            'department_id' => 'nullable|exists:departments,id',
            'title'         => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:30',
            'status'        => 'nullable|in:Active,Probation,Exiting,Inactive',
            'joined_at'     => 'nullable|date',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password'] ?? 'password'),
            'avatar'   => collect(explode(' ', $data['name']))->map(fn($w) => strtoupper($w[0]))->join(''),
        ]);
        $user->assignRole('employee');

        EmployeeProfile::create([
            'user_id'       => $user->id,
            'department_id' => $data['department_id'] ?? null,
            'title'         => $data['title'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'status'        => $data['status'] ?? 'Active',
            'joined_at'     => $data['joined_at'] ?? now(),
        ]);

        $user->load('profile.department');
        return response()->json(new UserResource($user), 201);
    }

    public function show(User $employee): JsonResponse
    {
        $employee->load('profile.department', 'emergencyContact');
        return response()->json(new UserResource($employee));
    }

    public function update(Request $request, User $employee): JsonResponse
    {
        $isHR = $request->user()->hasRole('hr_admin');
        $isSelf = $request->user()->id === $employee->id;

        if (!$isHR && !$isSelf) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Employees can only update phone and location
        if ($isSelf && !$isHR) {
            $data = $request->validate(['phone' => 'nullable|string|max:30', 'location' => 'nullable|string|max:255']);
            $employee->profile?->update($data);
            return response()->json(new UserResource($employee->load('profile.department')));
        }

        // HR Admin can update everything
        $data = $request->validate([
            'name'          => 'nullable|string|max:255',
            'email'         => 'nullable|email|unique:users,email,' . $employee->id,
            'department_id' => 'nullable|exists:departments,id',
            'title'         => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:30',
            'location'      => 'nullable|string|max:255',
            'status'        => 'nullable|in:Active,Probation,Exiting,Inactive',
        ]);

        $employee->update(array_filter(['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null]));
        $employee->profile?->update(array_filter([
            'department_id' => $data['department_id'] ?? null,
            'title'         => $data['title'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'location'      => $data['location'] ?? null,
            'status'        => $data['status'] ?? null,
        ]));

        return response()->json(new UserResource($employee->load('profile.department')));
    }

    public function destroy(User $employee): JsonResponse
    {
        $employee->delete();
        return response()->json(['message' => 'Employee removed']);
    }
}
