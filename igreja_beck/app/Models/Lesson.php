<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'course_id',
        'lesson_number',
        'title',
        'date',
        'topic',
        'is_completed',
    ];

    protected $casts = [
        'date' => 'date',
        'is_completed' => 'boolean',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
