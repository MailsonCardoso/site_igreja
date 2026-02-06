<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index()
    {
        $courses = Course::with(['students', 'lessons'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($courses);
    }

    /**
     * Store a newly created course.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'teacher' => 'nullable|string|max:255',
            'total_classes' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'schedule' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $course = Course::create($validated);
        return response()->json($course, 201);
    }

    /**
     * Display the specified course.
     */
    public function show($id)
    {
        $course = Course::findOrFail($id);
        return response()->json($course);
    }

    /**
     * Update the specified course.
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'teacher' => 'nullable|string|max:255',
            'total_classes' => 'nullable|integer|min:1',
            'completed_classes' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'schedule' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $course->update($validated);
        return response()->json($course);
    }

    /**
     * Remove the specified course.
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }

    /**
     * Enroll a student in the course
     */
    public function enrollStudent(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'enrolled_at' => 'nullable|date',
        ]);

        $course->students()->syncWithoutDetaching([
            $validated['member_id'] => [
                'enrolled_at' => $validated['enrolled_at'] ?? now()
            ]
        ]);

        return response()->json(['message' => 'Student enrolled successfully']);
    }

    /**
     * Remove a student from the course
     */
    public function removeStudent($id, $memberId)
    {
        $course = Course::findOrFail($id);
        $course->students()->detach($memberId);
        return response()->json(['message' => 'Student removed successfully']);
    }
}
