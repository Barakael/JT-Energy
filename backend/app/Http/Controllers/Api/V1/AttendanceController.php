<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\AttendanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AttendanceRecord::with('user');

        if (!$request->user()->hasRole('hr_admin')) {
            $query->where('user_id', $request->user()->id);
        } elseif ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->month) {
            $query->whereRaw("DATE_FORMAT(date, '%M %Y') = ?", [$request->month]);
        }

        if ($request->search && $request->user()->hasRole('hr_admin')) {
            $query->whereHas('user', fn($q) => $q->where('name', 'like', '%' . $request->search . '%'));
        }

        return response()->json(AttendanceResource::collection($query->latest('date')->paginate(50))->response()->getData(true));
    }

    public function clockIn(Request $request): JsonResponse
    {
        $record = AttendanceRecord::firstOrCreate(
            ['user_id' => $request->user()->id, 'date' => today()],
            ['status' => 'Present']
        );

        if ($record->clock_in) {
            return response()->json(['message' => 'Already clocked in today'], 422);
        }

        $clockIn = now()->format('H:i');
        $status = now()->format('H:i') > '09:05' ? 'Late' : 'Present';
        $record->update(['clock_in' => $clockIn, 'status' => $status]);

        return response()->json(new AttendanceResource($record->load('user')));
    }

    public function clockOut(Request $request): JsonResponse
    {
        $record = AttendanceRecord::where('user_id', $request->user()->id)
            ->where('date', today())
            ->first();

        if (!$record || !$record->clock_in) {
            return response()->json(['message' => 'No clock-in record found for today'], 422);
        }

        if ($record->clock_out) {
            return response()->json(['message' => 'Already clocked out today'], 422);
        }

        $clockOut = now()->format('H:i');
        $hours = round((strtotime($clockOut) - strtotime($record->clock_in)) / 3600, 2);
        $status = $hours < 4 ? 'Half Day' : $record->status;

        $record->update(['clock_out' => $clockOut, 'hours' => $hours, 'status' => $status]);

        return response()->json(new AttendanceResource($record->load('user')));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id'   => 'required|exists:users,id',
            'date'      => 'required|date',
            'clock_in'  => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i',
            'status'    => 'required|in:Present,Absent,Late,Half Day',
        ]);

        $record = AttendanceRecord::updateOrCreate(
            ['user_id' => $data['user_id'], 'date' => $data['date']],
            $data
        );

        return response()->json(new AttendanceResource($record->load('user')));
    }
}
