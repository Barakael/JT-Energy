<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::with('head', 'station')->withCount('profiles')->get();
        return response()->json($departments->map(fn($d) => [
            'id'          => $d->id,
            'name'        => $d->name,
            'code'        => $d->code,
            'description' => $d->description,
            'positions'   => $d->positions,
            'station'     => $d->station?->name,
            'station_id'  => $d->station_id,
            'active'      => $d->active,
            'head'        => $d->head?->name,
            'head_user_id'=> $d->head_user_id,
            'employees'   => $d->profiles_count,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|unique:departments,name',
            'code'         => 'required|string|unique:departments,code',
            'description'  => 'nullable|string',
            'positions'    => 'nullable|string',
            'station_id'   => 'nullable|exists:stations,id',
            'active'       => 'boolean',
            'head_user_id' => 'nullable|exists:users,id',
        ]);
        $dept = Department::create($data);
        return response()->json($dept, 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'nullable|string|unique:departments,name,' . $department->id,
            'code'         => 'nullable|string|unique:departments,code,' . $department->id,
            'description'  => 'nullable|string',
            'positions'    => 'nullable|string',
            'station_id'   => 'nullable|exists:stations,id',
            'active'       => 'boolean',
            'head_user_id' => 'nullable|exists:users,id',
        ]);
        $department->update($data);
        return response()->json($department->fresh(['head', 'station']));
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(['message' => 'Department removed']);
    }
}
