<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'employee'       => $this->user?->name,
            'type'           => $this->type,
            'uploaded_date'  => $this->created_at->format('M d, Y'),
            'size'           => $this->file_size ? round($this->file_size / 1024, 1) . ' KB' : null,
            'status'         => $this->status,
        ];
    }
}
