<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
	use SoftDeletes;

    protected $dates = ['deleted_at'];
    
    public function documents()
    {
    	return $this->hasMany('App\Document');
    }

    public function groups()
    {
    	return $this->belongsToMany('App\Group');
    }
}
