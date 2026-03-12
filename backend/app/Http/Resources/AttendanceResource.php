<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'        => $this->id,
            'user'      => $this->whenLoaded('user', fn() => ['id' => $this->user->id, 'name' => $this->user->name]),
            'date'      => $this->date->format('M d, Y'),
            'clock_in'  => $this->clock_in ?? '—',
            'clock_out' => $this->clock_out ?? '—',
            'hours'     => $this->hours ? $this->hours . 'h' : '—',
            'status'    => $this->status,
        ];
    }
}
