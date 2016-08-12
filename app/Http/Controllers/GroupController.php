<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use DB;
use App\Group;
use App\Http\Requests;

class GroupController extends Controller
{
    public function checkDuplicate(Request $request)
    {
        $group = $request->id ? Group::whereNotIn('id', [$request->id])->where('name', $request->name)->first() : Group::where('name', $request->name)->first();

        return response()->json($group ? true : false);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Group::with('categories', 'users')->get();
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
        $this->validate($request, [
            'name' => 'required'
        ]);

        $duplicate = Group::where('name', $request->name)->first();

        if($duplicate)
        {
            return response()->json(true);
        }

        $group = new Group;

        $group->name = $request->name;

        $group->save();

        return $group->id;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Group::with('categories', 'users')->where('id', $id)->first();
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
        $this->validate($request, [
            'name' => 'required'
        ]);

        $duplicate = Group::whereNotIn('id', [$id])->where('name', $request->name)->first();

        if($duplicate)
        {
            return response()->json(true);
        }

        $group = Group::where('id', $id)->first();

        $group->name = $request->name;

        $group->save();

        return $group->id;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Group::where('id', $id)->delete();
    }
}
