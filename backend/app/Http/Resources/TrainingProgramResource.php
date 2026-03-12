<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TrainingProgramResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'title'             => $this->title,
            'category'          => $this->category,
            'instructor'        => $this->instructor,
            'duration'          => $this->duration,
            'enrolled'          => $this->enrollments()->count(),
            'enrollments_count' => $this->enrollments()->count(),
            'status'            => $this->status,
            'description'       => $this->description,
            'venue'             => $this->venue,
            'start_date'        => $this->start_date?->format('Y-m-d'),
            'end_date'          => $this->end_date?->format('Y-m-d'),
            'start_time'        => $this->start_time,
            'end_time'          => $this->end_time,
            'mode'              => $this->mode,
            'max_capacity'      => $this->max_capacity,
            // For employee: their own enrollment pivot data
            'my_progress' => $this->whenPivotLoaded('training_enrollments', fn() => $this->pivot->progress),
            'my_status'   => $this->whenPivotLoaded('training_enrollments', fn() => $this->pivot->status),
        ];
    }
}
