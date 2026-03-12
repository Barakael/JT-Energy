<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Models\HrJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(): JsonResponse
    {
        $jobs = HrJob::with('department.station')->latest()->paginate(20);
        return response()->json(JobResource::collection($jobs)->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'location'      => 'nullable|string',
            'type'          => 'required|in:Full-time,Part-time,Contract,Internship',
            'status'        => 'nullable|in:Open,Closed',
            'description'   => 'nullable|string',
        ]);

        $job = HrJob::create(array_merge($data, [
            'created_by' => $request->user()->id,
            'posted_at'  => now(),
        ]));
        return response()->json(new JobResource($job->load('department.station')), 201);
    }

    public function update(Request $request, HrJob $job): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'location'      => 'nullable|string',
            'type'          => 'nullable|in:Full-time,Part-time,Contract,Internship',
            'status'        => 'nullable|in:Open,Closed',
            'description'   => 'nullable|string',
        ]);
        $job->update($data);
        return response()->json(new JobResource($job->load('department')));
    }

    public function destroy(HrJob $job): JsonResponse
    {
        $job->delete();
        return response()->json(['message' => 'Job posting removed']);
    }
}
