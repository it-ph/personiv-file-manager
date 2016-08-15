<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Category;
use App\Group;
use DB;
use App\Http\Requests;

class CategoryController extends Controller
{
    // public function search(Request $request)
    // {
    //     return DB::table('categories')
    //         ->select(
    //             '*',
    //             DB::raw('UPPER(LEFT(name, 1)) as first_letter'),
    //             DB::raw('DATE_FORMAT(created_at, "%b. %d, %Y") as created_at_formatted')
    //         )
    //         ->where('name', 'like', '%'. $request->userInput. '%')
    //         ->where('description', 'like', '%'. $request->userInput. '%')
    //         ->get();
    // }
    public function userGroups(Request $request)
    {
        $this->groups = $request->all();

        $categories = Group::with(['categories' => function($query){ $query->with('documents'); }])->whereIn('id', $request->all())->get();

        return $categories;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Category::with('groups', 'documents')->get();
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
            'name' => 'required',
            'description' => 'required',
        ]);

        $category = new Category;

        $category->name = $request->name;
        $category->description = $request->description;

        $category->save();

        return $category->id;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Category::with('groups')->where('id', $id)->first();
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
            'name' => 'required',
            'description' => 'required',
        ]);

        $category = Category::where('id', $id)->first();

        $category->name = $request->name;
        $category->description = $request->description;

        $category->save();

        return $category->id;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Category::where('id', $id)->delete();
    }
}
