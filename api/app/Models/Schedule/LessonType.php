<?php

namespace App\Models\Schedule;

use Illuminate\Database\Eloquent\Model;

class LessonType extends Model
{
    protected $fillable = ['code', 'name', 'color'];
}
