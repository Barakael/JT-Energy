<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NewHireResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role,
            'dept'       => $this->department?->name,
            'department_id' => $this->department_id,
            'start_date' => $this->start_date?->format('M d, Y'),
            'progress'   => $this->progress,
            'buddy'      => $this->buddy?->name,
            'buddy_id'   => $this->buddy_id,
        ];
    }
}
