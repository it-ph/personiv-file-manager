<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CategoryGroup extends Model
{
	protected $table = 'category_group';

    public function group()
    {
    	return $this->belongsTo('App\Group');
    }

    public function category()
    {
    	return $this->belongsTo('App\Category');
    }
}
