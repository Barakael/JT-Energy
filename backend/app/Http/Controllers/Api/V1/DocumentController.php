<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with('user:id,name', 'uploader:id,name');

        if (!$request->user()->hasRole('hr_admin')) {
            $query->where('user_id', $request->user()->id);
        }

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        return response()->json($query->orderByDesc('created_at')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'title'   => 'required|string',
            'type'    => 'required|in:Contract,Legal,Review,Certificate,Policy,Other',
            'file'    => 'nullable|file|max:10240',
        ]);

        $path     = null;
        $fileSize = null;

        if ($request->hasFile('file')) {
            $path     = $request->file('file')->store('documents', 'local');
            $fileSize = $request->file('file')->getSize();
        }

        $document = Document::create([
            'user_id'      => $request->user_id ?? $request->user()->id,
            'title'        => $request->title,
            'type'         => $request->type,
            'file_path'    => $path,
            'file_size'    => $fileSize ? round($fileSize / 1024) . ' KB' : null,
            'status'       => 'Active',
            'uploaded_by'  => $request->user()->id,
        ]);

        return response()->json($document->load('user:id,name'), 201);
    }

    public function destroy(Document $document): JsonResponse
    {
        if ($document->file_path) {
            Storage::delete($document->file_path);
        }
        $document->delete();
        return response()->json(['message' => 'Document deleted']);
    }

    public function download(Document $document, Request $request): mixed
    {
        if (!$request->user()->hasRole('hr_admin') && $document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($document->file_path && Storage::exists($document->file_path)) {
            return Storage::download($document->file_path, $document->title);
        }

        return response()->json(['message' => 'File not found'], 404);
    }
}
