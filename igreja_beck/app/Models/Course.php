<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'name',
        'description',
        'teacher',
        'total_classes',
        'completed_classes',
        'start_date',
        'end_date',
        'schedule',
        'location',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function students()
    {
        return $this->belongsToMany(Member::class, 'course_students')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }
}
