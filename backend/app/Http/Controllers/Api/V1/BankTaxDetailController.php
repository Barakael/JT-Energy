<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BankTaxDetailResource;
use App\Models\BankTaxDetail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankTaxDetailController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BankTaxDetail::with('user');

        if ($search = $request->query('search')) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $records = $query->latest()->paginate(20);

        return response()->json(BankTaxDetailResource::collection($records)->response()->getData(true));
    }

    // Employee self-service: get or upsert their own record
    public function mine(Request $request): JsonResponse
    {
        $record = BankTaxDetail::firstOrNew(['user_id' => $request->user()->id]);
        $record->load('user');
        return response()->json(new BankTaxDetailResource($record));
    }

    public function updateMine(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bank_name'          => 'nullable|string|max:255',
            'account_name'       => 'nullable|string|max:255',
            'account_type'       => 'nullable|string|max:50',
            'account_number'     => 'nullable|string|max:50',
            'sort_code'          => 'nullable|string|max:20',
            'swift_bic'          => 'nullable|string|max:30',
            'iban'               => 'nullable|string|max:50',
            'tax_code'           => 'nullable|string|max:20',
            'national_insurance' => 'nullable|string|max:20',
        ]);

        $record = BankTaxDetail::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json(new BankTaxDetailResource($record->load('user')));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id'            => 'required|exists:users,id|unique:bank_tax_details,user_id',
            'bank_name'          => 'nullable|string|max:255',
            'account_name'       => 'nullable|string|max:255',
            'account_type'       => 'nullable|string|max:50',
            'account_number'     => 'nullable|string|max:50',
            'sort_code'          => 'nullable|string|max:20',
            'swift_bic'          => 'nullable|string|max:30',
            'iban'               => 'nullable|string|max:50',
            'tax_code'           => 'nullable|string|max:20',
            'national_insurance' => 'nullable|string|max:20',
        ]);

        $record = BankTaxDetail::create($data);

        return response()->json(new BankTaxDetailResource($record->load('user')), 201);
    }

    public function show(BankTaxDetail $bank_tax): JsonResponse
    {
        $bank_tax->load('user');
        return response()->json(new BankTaxDetailResource($bank_tax));
    }

    public function update(Request $request, BankTaxDetail $bank_tax): JsonResponse
    {
        $data = $request->validate([
            'bank_name'          => 'nullable|string|max:255',
            'account_name'       => 'nullable|string|max:255',
            'account_type'       => 'nullable|string|max:50',
            'account_number'     => 'nullable|string|max:50',
            'sort_code'          => 'nullable|string|max:20',
            'swift_bic'          => 'nullable|string|max:30',
            'iban'               => 'nullable|string|max:50',
            'tax_code'           => 'nullable|string|max:20',
            'national_insurance' => 'nullable|string|max:20',
        ]);

        $bank_tax->update($data);

        return response()->json(new BankTaxDetailResource($bank_tax->load('user')));
    }

    public function destroy(BankTaxDetail $bank_tax): JsonResponse
    {
        $bank_tax->delete();
        return response()->json(['message' => 'Bank & tax record deleted']);
    }
}
