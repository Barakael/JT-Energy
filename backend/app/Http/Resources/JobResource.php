<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'department_id'   => $this->department_id,
            'department_name' => $this->department?->name,
            'station_name'    => $this->department?->station?->name,
            'location'        => $this->location,
            'type'            => $this->type,
            'applicants'      => $this->applicants,
            'status'          => $this->status,
            'description'     => $this->description,
            'posted_at'       => $this->posted_at?->format('M d, Y'),
        ];
    }
}
