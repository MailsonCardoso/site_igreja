<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Attendance;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * Get all lessons for a course
     */
    public function index($courseId)
    {
        $lessons = Lesson::where('course_id', $courseId)
            ->with('attendances.member')
            ->orderBy('lesson_number')
            ->get();
        return response()->json($lessons);
    }

    /**
     * Create a new lesson
     */
    public function store(Request $request, $courseId)
    {
        $validated = $request->validate([
            'lesson_number' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'topic' => 'nullable|string',
        ]);

        $validated['course_id'] = $courseId;
        $lesson = Lesson::create($validated);

        return response()->json($lesson, 201);
    }

    /**
     * Update a lesson
     */
    public function update(Request $request, $courseId, $lessonId)
    {
        $lesson = Lesson::where('course_id', $courseId)->findOrFail($lessonId);

        $validated = $request->validate([
            'lesson_number' => 'sometimes|integer',
            'title' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'topic' => 'nullable|string',
            'is_completed' => 'sometimes|boolean',
        ]);

        $lesson->update($validated);

        // Update course completed_classes count
        if (isset($validated['is_completed'])) {
            $course = Course::find($courseId);
            $completedCount = Lesson::where('course_id', $courseId)
                ->where('is_completed', true)
                ->count();
            $course->update(['completed_classes' => $completedCount]);
        }

        return response()->json($lesson);
    }

    /**
     * Delete a lesson
     */
    public function destroy($courseId, $lessonId)
    {
        $lesson = Lesson::where('course_id', $courseId)->findOrFail($lessonId);
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted successfully']);
    }

    /**
     * Record attendance for a lesson
     */
    public function recordAttendance(Request $request, $courseId, $lessonId)
    {
        $validated = $request->validate([
            'attendances' => 'required|array',
            'attendances.*.member_id' => 'required|exists:members,id',
            'attendances.*.status' => 'required|in:present,absent,justified',
            'attendances.*.notes' => 'nullable|string',
        ]);

        foreach ($validated['attendances'] as $attendanceData) {
            Attendance::updateOrCreate(
                [
                    'lesson_id' => $lessonId,
                    'member_id' => $attendanceData['member_id'],
                ],
                [
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                ]
            );
        }

        return response()->json(['message' => 'Attendance recorded successfully']);
    }
}
