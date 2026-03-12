<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Asset::with(['category', 'station', 'creator']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('asset_tag', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $assets = $query->latest()->get();

        return response()->json($assets->map(function ($a) {
            return [
                'id'              => $a->id,
                'asset_tag'       => $a->asset_tag,
                'name'            => $a->name,
                'category_id'     => $a->category_id,
                'category_name'   => $a->category?->name,
                'serial_number'   => $a->serial_number,
                'purchase_date'   => $a->purchase_date?->format('Y-m-d'),
                'purchase_price'  => $a->purchase_price,
                'warranty_expiry' => $a->warranty_expiry?->format('Y-m-d'),
                'station_id'      => $a->station_id,
                'station_name'    => $a->station?->name,
                'description'     => $a->description,
                'quantity'        => $a->quantity ?? 1,
                'created_by_name' => $a->creator?->name,
                'created_at'      => $a->created_at->toDateTimeString(),
            ];
        }));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'asset_tag'       => 'required|string|max:100|unique:assets,asset_tag',
            'name'            => 'required|string|max:255',
            'category_id'     => 'nullable|exists:asset_categories,id',
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'purchase_price'  => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date',
            'station_id'      => 'nullable|exists:stations,id',
            'description'     => 'nullable|string',
            'quantity'        => 'nullable|integer|min:1',
        ]);

        $data['quantity'] = $data['quantity'] ?? 1;
        $asset = Asset::create(array_merge($data, ['created_by' => $request->user()->id]));
        $asset->load(['category', 'station', 'creator']);

        return response()->json([
            'id'              => $asset->id,
            'asset_tag'       => $asset->asset_tag,
            'name'            => $asset->name,
            'category_id'     => $asset->category_id,
            'category_name'   => $asset->category?->name,
            'serial_number'   => $asset->serial_number,
            'purchase_date'   => $asset->purchase_date?->format('Y-m-d'),
            'purchase_price'  => $asset->purchase_price,
            'warranty_expiry' => $asset->warranty_expiry?->format('Y-m-d'),
            'station_id'      => $asset->station_id,
            'station_name'    => $asset->station?->name,
            'description'     => $asset->description,
            'quantity'        => $asset->quantity ?? 1,
            'created_by_name' => $asset->creator?->name,
            'created_at'      => $asset->created_at->toDateTimeString(),
        ], 201);
    }

    public function update(Request $request, Asset $asset): JsonResponse
    {
        $data = $request->validate([
            'asset_tag'       => 'nullable|string|max:100|unique:assets,asset_tag,' . $asset->id,
            'name'            => 'nullable|string|max:255',
            'category_id'     => 'nullable|exists:asset_categories,id',
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'purchase_price'  => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date',
            'station_id'      => 'nullable|exists:stations,id',
            'description'     => 'nullable|string',
            'quantity'        => 'nullable|integer|min:1',
        ]);

        $asset->update($data);
        $asset->load(['category', 'station', 'creator']);

        return response()->json([
            'id'              => $asset->id,
            'asset_tag'       => $asset->asset_tag,
            'name'            => $asset->name,
            'category_id'     => $asset->category_id,
            'category_name'   => $asset->category?->name,
            'serial_number'   => $asset->serial_number,
            'purchase_date'   => $asset->purchase_date?->format('Y-m-d'),
            'purchase_price'  => $asset->purchase_price,
            'warranty_expiry' => $asset->warranty_expiry?->format('Y-m-d'),
            'station_id'      => $asset->station_id,
            'station_name'    => $asset->station?->name,
            'description'     => $asset->description,
            'quantity'        => $asset->quantity ?? 1,
            'created_by_name' => $asset->creator?->name,
            'created_at'      => $asset->created_at->toDateTimeString(),
        ]);
    }

    public function destroy(Asset $asset): JsonResponse
    {
        $asset->delete();
        return response()->json(['message' => 'Asset deleted']);
    }
}
