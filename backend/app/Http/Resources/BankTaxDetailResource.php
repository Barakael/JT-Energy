<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BankTaxDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'user_name'          => $this->user?->name,
            'user_email'         => $this->user?->email,
            'bank_name'          => $this->bank_name,
            'account_name'       => $this->account_name,
            'account_type'       => $this->account_type,
            'masked_account'     => $this->masked_account,
            'account_number'     => $this->account_number,
            'sort_code'          => $this->sort_code,
            'swift_bic'          => $this->swift_bic,
            'iban'               => $this->iban,
            'tax_code'           => $this->tax_code,
            'national_insurance' => $this->national_insurance,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
