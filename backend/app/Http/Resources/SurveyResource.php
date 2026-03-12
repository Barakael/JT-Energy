<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SurveyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'status'       => $this->status,
            'responses'    => $this->responses()->count(),
            'created_date' => $this->created_at->format('M d, Y'),
            'questions'    => $this->whenLoaded('questions', fn() =>
                $this->questions->map(fn($q) => [
                    'id'      => $q->id,
                    'text'    => $q->text,
                    'type'    => $q->type,
                    'options' => $q->options,
                    'order'   => $q->order,
                ])
            ),
        ];
    }
}
