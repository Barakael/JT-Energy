<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'user'        => $this->whenLoaded('user', fn() => ['id' => $this->user->id, 'name' => $this->user->name]),
            'type'        => $this->type,
            'from_date'   => $this->from_date->format('M d, Y'),
            'to_date'     => $this->to_date->format('M d, Y'),
            'days'        => $this->days,
            'reason'      => $this->reason,
            'status'      => $this->status,
            'reviewed_by' => $this->reviewer?->name,
            'reviewed_at' => $this->reviewed_at?->format('M d, Y'),
            'created_at'  => $this->created_at->format('M d, Y'),
        ];
    }
}
