<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use DB;
use App\CategoryGroup;
use App\Http\Requests;

class CategoryGroupController extends Controller
{
    public function relation($category_id, $group_id)
    {
        $relation = CategoryGroup::where('category_id', $category_id)->where('group_id', $group_id)->first();

        return response()->json($relation ? true : false);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        CategoryGroup::where('category_id', $request->input('0.category_id'))->delete();

        for ($i=0; $i < count($request->all()); $i++) { 
            if($request->input($i)){
                $this->validate($request, [
                    $i.'.category_id' => 'required|numeric',
                    $i.'.id' => 'required|numeric',
                ]);

                $category_group = new CategoryGroup;

                $category_group->category_id = $request->input($i.'.category_id');
                $category_group->group_id = $request->input($i.'.id');

                $category_group->save();
            }
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        CategoryGroup::where('category_id', $id)->delete();

        for ($i=0; $i < count($request->all()); $i++) { 
            if($request->input($i.'.include')){
                $this->validate($request, [
                    $i.'.category_id' => 'required|numeric',
                    $i.'.id' => 'required|numeric',
                ]);

                $category_group = new CategoryGroup;

                $category_group->category_id = $request->input($i.'.category_id');
                $category_group->group_id = $request->input($i.'.id');

                $category_group->save();
            }
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
