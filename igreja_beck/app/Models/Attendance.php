<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'lesson_id',
        'member_id',
        'status',
        'notes',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
