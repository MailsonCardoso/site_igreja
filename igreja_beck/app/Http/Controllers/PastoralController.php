<?php

namespace App\Http\Controllers;

use App\Models\PastoralAppointment;
use App\Models\PastoralRequest;
use App\Models\PastorSermon;
use App\Models\PastorSeries;
use App\Models\PastorInsight;
use Illuminate\Http\Request;

class PastoralController extends Controller
{
    /**
     * Display a listing of appointments and requests.
     */
    public function index()
    {
        // Fetch appointments with member phone
        $appointments = PastoralAppointment::leftJoin('members', 'pastoral_appointments.member_id', '=', 'members.id')
            ->select('pastoral_appointments.*', 'members.phone as member_phone')
            ->orderBy('pastoral_appointments.date', 'desc')
            ->get();

        // Fetch requests with member phone
        $requests = PastoralRequest::leftJoin('members', 'pastoral_requests.member_id', '=', 'members.id')
            ->select('pastoral_requests.*', 'members.phone as member_phone')
            ->where('pastoral_requests.status', '!=', 'Agendado')
            ->orderBy('pastoral_requests.created_at', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
            'requests' => $requests
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

    // ===================== SERMÕES =====================

    public function indexSermons()
    {
        $sermons = PastorSermon::orderBy('date', 'desc')->get();
        return response()->json($sermons);
    }

    public function storeSermon(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'series' => 'required|string',
            'verse' => 'nullable|string',
            'date' => 'required|date',
            'status' => 'required|string',
            'color' => 'nullable|string',
            'content' => 'nullable|array',
        ]);

        $sermon = PastorSermon::create(array_merge($request->all(), [
            'user_id' => $request->user()->id ?? null
        ]));

        return response()->json($sermon, 201);
    }

    public function updateSermon(Request $request, $id)
    {
        $sermon = PastorSermon::findOrFail($id);
        $sermon->update($request->all());
        return response()->json($sermon);
    }

    public function destroySermon($id)
    {
        PastorSermon::destroy($id);
        return response()->json(null, 204);
    }

    // ===================== SÉRIES =====================

    public function indexSeries()
    {
        $series = PastorSeries::orderBy('start_date', 'desc')->get();
        return response()->json($series);
    }

    public function storeSeries(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'total' => 'nullable|integer',
            'completed' => 'nullable|integer',
            'color' => 'nullable|string',
            'cover_color' => 'nullable|string',
            'start_date' => 'nullable|date',
        ]);

        $series = PastorSeries::create(array_merge($request->all(), [
            'user_id' => $request->user()->id ?? null
        ]));

        return response()->json($series, 201);
    }

    public function updateSeries(Request $request, $id)
    {
        $series = PastorSeries::findOrFail($id);
        $series->update($request->all());
        return response()->json($series);
    }

    public function destroySeries($id)
    {
        PastorSeries::destroy($id);
        return response()->json(null, 204);
    }

    // ===================== INSIGHTS =====================

    public function indexInsights()
    {
        $insights = PastorInsight::orderBy('created_at', 'desc')->get();
        return response()->json($insights);
    }

    public function storeInsight(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'content' => 'required|string',
            'title' => 'nullable|string',
            'reference' => 'nullable|string',
            'tags' => 'nullable|array',
            'sermon_id' => 'nullable|integer',
        ]);

        $insight = PastorInsight::create(array_merge($request->all(), [
            'user_id' => $request->user()->id ?? null
        ]));

        return response()->json($insight, 201);
    }

    public function updateInsight(Request $request, $id)
    {
        $insight = PastorInsight::findOrFail($id);
        $insight->update($request->all());
        return response()->json($insight);
    }

    public function destroyInsight($id)
    {
        PastorInsight::destroy($id);
        return response()->json(null, 204);
    }
}
