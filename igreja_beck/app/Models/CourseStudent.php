<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseStudent extends Pivot
{
    protected $fillable = [
        'course_id',
        'member_id',
        'enrolled_at',
    ];

    protected $casts = [
        'enrolled_at' => 'date',
    ];
}
