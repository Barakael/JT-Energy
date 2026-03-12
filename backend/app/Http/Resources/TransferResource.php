<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'employee'      => $this->user?->name,
            'from_dept'     => $this->fromDepartment?->name,
            'to_dept'       => $this->toDepartment?->name,
            'from_role'     => $this->from_role,
            'to_role'       => $this->to_role,
            'effective_date'=> $this->effective_date->format('M d, Y'),
            'reason'        => $this->reason,
            'status'        => $this->status,
        ];
    }
}
