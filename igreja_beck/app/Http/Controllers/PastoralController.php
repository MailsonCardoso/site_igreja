<?php

namespace App\Http\Controllers;

use App\Models\PastoralAppointment;
use App\Models\PastoralRequest;
use Illuminate\Http\Request;

class PastoralController extends Controller
{
    /**
     * Display a listing of appointments and requests.
     */
    public function index()
    {
        return response()->json([
            'appointments' => PastoralAppointment::orderBy('date', 'desc')->get(),
            'requests' => PastoralRequest::orderBy('created_at', 'desc')->where('status', '!=', 'Agendado')->get()
        ]);
    }

    /**
     * Store a new appointment.
     */
    public function storeAppointment(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'person' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required', // Pode validar formato H:i
            'type' => 'required',
        ]);

        $appointment = PastoralAppointment::create($request->all());

        return response()->json($appointment, 201);
    }

    /**
     * Store a new request.
     */
    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'person' => 'required|string',
            'type' => 'required',
            'reason' => 'required',
        ]);

        $pastoralRequest = PastoralRequest::create(array_merge($request->all(), [
            'requested_at' => now(),
            'status' => 'Pendente'
        ]));

        return response()->json($pastoralRequest, 201);
    }

    /**
     * Update the specified appointment.
     */
    public function updateAppointment(Request $request, $id)
    {
        $appointment = PastoralAppointment::findOrFail($id);
        $appointment->update($request->all());
        return response()->json($appointment);
    }

    /**
     * Remove the specified appointment.
     */
    public function destroyAppointment($id)
    {
        PastoralAppointment::destroy($id);
        return response()->json(null, 204);
    }

    /**
     * Remove the specified request (or mark as scheduled).
     */
    public function destroyRequest($id)
    {
        PastoralRequest::destroy($id);
        return response()->json(null, 204);
    }
}
