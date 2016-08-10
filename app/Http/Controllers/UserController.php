<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use Auth;
use Hash;
use App\User;

class UserController extends Controller
{
    public function all()
    {
        return User::all();
    }

    public function checkEmail(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        return response()->json($user ? true : false);
    }

    public function resetPassword($id)
    {
        if(Auth::user()->role != 'super-admin')
        {
            abort(403, 'Unauthorized action.');
        }
        else{
            $user = User::where('id', $id)->first();

            $user->password = Hash::make('!welcome10');

            $user->save();
        }

    }

    public function others()
    {
        return User::whereNotIn('role', ['super-admin'])->whereNotIn('id', [Auth::user()->id])->get();
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        if($request->new == $request->confirm && $request->old != $request->new)
        {
            $user->password = Hash::make($request->new);
        }

        $user->save();
    }
    public function checkPassword(Request $request)
    {
        return response()->json(Hash::check($request->old, $request->user()->password));
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Auth::user();
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
        $check_user = User::where('email', $request->email)->first();

        if($check_user)
        {
            return response()->json(true);
        }

        $this->validate($request, [
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'role' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:8',
        ]);

        $user = new User;

        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->password = Hash::make($request->password);

        $user->save();
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        User::where('id', $id)->delete();
    }
}
