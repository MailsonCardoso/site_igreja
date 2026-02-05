<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Roster extends Model
{
    use HasFactory;

    protected $fillable = ['ministry_id', 'date'];

    protected $casts = ['date' => 'date'];

    public function ministry()
    {
        return $this->belongsTo(Ministry::class);
    }

    public function members()
    {
        // Many members can be on a roster, with extra 'role' (função)
        return $this->belongsToMany(Member::class, 'roster_members')
            ->withPivot('role');
    }
}
