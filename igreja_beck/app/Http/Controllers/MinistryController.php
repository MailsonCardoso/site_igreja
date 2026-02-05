<?php

namespace App\Http\Controllers;

use App\Models\Ministry;
use App\Services\RosterService;
use Illuminate\Http\Request;

class MinistryController extends Controller
{
    protected $rosterService;

    public function __construct(RosterService $rosterService)
    {
        $this->rosterService = $rosterService;
    }

    public function index()
    {
        return response()->json(Ministry::with('leader')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'leader_id' => 'nullable|exists:members,id',
        ]);

        $ministry = Ministry::create($validated);
        return response()->json($ministry, 201);
    }

    public function generateRosters(Request $request, Ministry $ministry)
    {
        $weeks = $request->input('weeks', 4);
        $result = $this->rosterService->generateAutomatic($ministry->id, $weeks);

        return response()->json($result);
    }
}
