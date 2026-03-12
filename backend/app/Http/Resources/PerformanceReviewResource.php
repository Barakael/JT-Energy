<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'employee'   => $this->reviewee?->name,
            'department' => $this->department?->name,
            'reviewer'   => $this->reviewer?->name,
            'rating'     => $this->rating,
            'period'     => $this->period,
            'feedback'   => $this->feedback,
            'status'     => $this->status,
            'created_at' => $this->created_at->format('M d, Y'),
        ];
    }
}
