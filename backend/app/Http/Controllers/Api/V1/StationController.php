<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StationController extends Controller
{
    public function index(): JsonResponse
    {
        $stations = Station::withCount('departments')->get();
        return response()->json($stations->map(fn($s) => [
            'id'          => $s->id,
            'name'        => $s->name,
            'code'        => $s->code,
            'description' => $s->description,
            'location'    => $s->location,
            'active'      => $s->active,
            'departments' => $s->departments_count,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|unique:stations,code',
            'description' => 'nullable|string',
            'location'    => 'nullable|string',
            'active'      => 'boolean',
        ]);
        $station = Station::create($data);
        return response()->json($station, 201);
    }

    public function update(Request $request, Station $station): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'nullable|string|max:255',
            'code'        => 'nullable|string|unique:stations,code,' . $station->id,
            'description' => 'nullable|string',
            'location'    => 'nullable|string',
            'active'      => 'boolean',
        ]);
        $station->update($data);
        return response()->json($station->fresh());
    }

    public function destroy(Station $station): JsonResponse
    {
        $station->delete();
        return response()->json(['message' => 'Station deleted']);
    }
}
