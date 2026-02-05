<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ministry extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'leader_id'];

    public function leader()
    {
        return $this->belongsTo(Member::class, 'leader_id');
    }

    public function rosters()
    {
        return $this->hasMany(Roster::class);
    }
}
