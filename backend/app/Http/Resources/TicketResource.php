<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'ticket_number'  => $this->ticket_number,
            'subject'        => $this->subject,
            'description'    => $this->description,
            'category'       => $this->category,
            'priority'       => $this->priority,
            'status'         => $this->status,
            'submitted_by'   => $this->user?->name,
            'assigned_to'    => $this->assignee?->name,
            'date'           => $this->created_at->format('M d, Y'),
        ];
    }
}
