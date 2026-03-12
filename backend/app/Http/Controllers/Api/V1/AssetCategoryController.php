<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = AssetCategory::withCount('assets')->orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255|unique:asset_categories,name',
            'description' => 'nullable|string',
        ]);

        $category = AssetCategory::create($data);
        return response()->json($category, 201);
    }

    public function update(Request $request, AssetCategory $assetCategory): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255|unique:asset_categories,name,' . $assetCategory->id,
            'description' => 'nullable|string',
        ]);

        $assetCategory->update($data);
        return response()->json($assetCategory);
    }

    public function destroy(AssetCategory $assetCategory): JsonResponse
    {
        $assetCategory->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
