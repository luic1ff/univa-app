<?php

namespace App\Models\Schedule;

use Illuminate\Database\Eloquent\Model;

class RecurrenceRule extends Model
{
    protected $fillable = ['code', 'name', 'meta'];

    protected $casts = [
        'meta' => 'array',
    ];
}
