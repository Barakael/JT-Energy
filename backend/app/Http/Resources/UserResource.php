<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'employee_id' => $this->employee_id,
            'avatar'      => $this->avatar,
            'role'        => $this->getRoleNames()->first(),
            'profile'     => $this->whenLoaded('profile', fn() => [
                'department_id' => $this->profile->department_id,
                'department'    => $this->profile->department?->name,
                'title'         => $this->profile->title,
                'phone'         => $this->profile->phone,
                'location'      => $this->profile->location,
                'status'        => $this->profile->status,
                'joined_at'     => $this->profile->joined_at?->format('M Y'),
                'manager'       => $this->profile->manager?->name,
            ]),
            'emergency_contact' => $this->whenLoaded('emergencyContact', fn() => $this->emergencyContact),
        ];
    }
}
