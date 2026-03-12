<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PayslipResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'period'      => $this->period,
            'gross'       => number_format($this->gross, 2),
            'deductions'  => number_format($this->deductions, 2),
            'net'         => number_format($this->net, 2),
            'status'      => $this->status,
        ];
    }
}
