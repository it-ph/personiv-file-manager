<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Document;
use App\Category;
use App\Tag;
use App\User;
use DB;
use Auth;
use App\Http\Requests;
use File;
use Storage;
use Response;

class DocumentController extends Controller
{
    public function search(Request $request, $id)
    {
        $id = (int)$id;
        $this->category_id = $id;
        $this->userInput = $request->userInput;
        
        if($id)
        {
            $documents = DB::table('documents')
                ->join('tags', 'tags.document_id', '=', 'documents.id')
                ->select(
                    '*',
                    DB::raw('UPPER(LEFT(documents.file_name, 1)) as first_letter'),
                    DB::raw('DATE_FORMAT(documents.created_at, "%b. %d, %Y") as created_at_formatted')
                )
                ->where(function($query){ $query->where('documents.category_id', $this->category_id)->where('documents.file_name', 'like', '%'. $this->userInput .'%'); })
                ->orWhere(function($query){ $query->where('documents.category_id', $this->category_id)->where('tags.name', 'like', '%'. $this->userInput .'%'); })
                ->orderBy('documents.file_name')
                ->groupBy('documents.id')
                ->get();
        }
        else if($request->user()){
            $user = User::with(['groups' => function($query){ $query->with('categories'); }])->where('id', $request->user()->id)->first();

            foreach ($user->groups as $group_key => $group) {
                foreach ($group->categories as $category_key => $category) {
                    $this->category = $category;

                    $category->documents = DB::table('documents')
                        ->join('tags', 'tags.document_id', '=', 'documents.id')
                        ->select(
                            '*',
                            DB::raw('UPPER(LEFT(documents.file_name, 1)) as first_letter'),
                            DB::raw('DATE_FORMAT(documents.created_at, "%b. %d, %Y") as created_at_formatted')
                        )
                        ->where(function($query){ $query->where('documents.category_id', $this->category->id)->where('documents.file_name', 'like', '%'. $this->userInput .'%'); })
                        ->orWhere(function($query){ $query->where('documents.category_id', $this->category->id)->where('tags.name', 'like', '%'. $this->userInput .'%'); })
                        ->orderBy('documents.file_name')
                        ->groupBy('documents.id')
                        ->get();

                    foreach ($category->documents as $document_key => $document) {
                        $tags = Tag::where('document_id', $document->document_id)->get();
                        
                        $document->tags = array();
                        
                        foreach ($tags as $tags_key => $tags_value) {
                            array_push($document->tags, $tags_value->name);
                        }
                    
                        $document->category = Category::with('groups')->where('id', $document->category_id)->first();
                    }
                }
            }

            $user->public = DB::table('documents')
                ->join('tags', 'tags.document_id', '=', 'documents.id')
                ->select(
                    '*',
                    DB::raw('UPPER(LEFT(documents.file_name, 1)) as first_letter'),
                    DB::raw('DATE_FORMAT(documents.created_at, "%b. %d, %Y") as created_at_formatted')
                )
                ->where('documents.file_name', 'like', '%'. $request->userInput .'%')
                ->orWhere('tags.name', 'like', '%'. $request->userInput .'%')
                ->orderBy('documents.file_name')
                ->groupBy('documents.id')
                ->get();

            foreach ($user->public as $document_key => $document) {
                $tags = Tag::where('document_id', $document->document_id)->get();
                
                $document->tags = array();
                
                foreach ($tags as $tags_key => $tags_value) {
                    array_push($document->tags, $tags_value->name);
                }
            
                $document->category = Category::with('groups')->where('id', $document->category_id)->first();
            }

            return $user;    
        }
        else{
            $documents = DB::table('documents')
                ->join('tags', 'tags.document_id', '=', 'documents.id')
                ->select(
                    '*',
                    DB::raw('UPPER(LEFT(documents.file_name, 1)) as first_letter'),
                    DB::raw('DATE_FORMAT(documents.created_at, "%b. %d, %Y") as created_at_formatted')
                )
                ->where('documents.file_name', 'like', '%'. $request->userInput .'%')
                ->orWhere('tags.name', 'like', '%'. $request->userInput .'%')
                ->orderBy('documents.file_name')
                ->groupBy('documents.id')
                ->get();
        }

        foreach ($documents as $document_key => $document) {
            $tags = Tag::where('document_id', $document->document_id)->get();
            
            $document->tags = array();
            
            foreach ($tags as $tags_key => $tags_value) {
                array_push($document->tags, $tags_value->name);
            }
        
            $document->category = Category::with('groups')->where('id', $document->category_id)->first();
        }

        return $documents;
    }
    public function view($id, $categoryID)
    {
        $this->document = Document::with(['category' => function($query){ $query->with('groups'); }])->where('id', $id)->first();

        if(count($this->document->category->groups)){
            if(!Auth::check()){
                return 'Unauthorized access';
            }

            $user = User::with(['groups' => function($query){ $query->with(['categories' => function($query){ $query->where('category_id', $this->document->category_id); }]); }])->where('id', Auth::user()->id)->first();

            $access = 0;

            if(count($user->groups)){
                foreach ($user->groups as $group_key => $group) {
                    if(count($group->categories)){
                        $access++;
                    }
                }

                if(!$access)
                {
                    return 'Unauthorized access';
                }
            }
        }


         // use question image_path to fetch the file
        $path = storage_path() .'/app/'. $this->document->path;

        $file = File::get($path);
        $type = File::mimeType($path);

        $response = Response::make($file, 200);
        $response->header("Content-Type", $type);

        return $response;
    }
    public function paginate($id)
    {
        $document = DB::table('documents')
            ->select(
                '*',
                DB::raw('UPPER(LEFT(documents.file_name, 1)) as first_letter'),
                DB::raw('DATE_FORMAT(documents.created_at, "%b. %d, %Y") as created_at_formatted')
            )
            ->where('documents.category_id', $id)
            ->orderBy('documents.file_name')
            ->paginate(15);

            foreach ($document as $document_key => $document_value) {
                $tags = Tag::where('document_id', $document_value->id)->get();
                
                $document_value->tags = array();
                
                foreach ($tags as $tags_key => $tags_value) {
                    array_push($document_value->tags, $tags_value->name);
                }
            }

        return $document;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // echo storage_path();
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
            'file_name' => 'required',
            'category_id' => 'required|numeric',
        ]);

        $document = new Document;
        
        $document->file_name = $request->file_name;
        $document->category_id = $request->category_id;

        $document->save();

        foreach ($request->tags as $key => $value) {
            $tag = new Tag;
            
            $tag->document_id = $document->id;
            $tag->name = $value;

            $tag->save();
        }

        $category = Category::where('id', $request->category_id)->first();

        $document->path = '/pdf/'. $category->name . '/'. $document->file_name . '.pdf';

        $document->save();
    }

    public function upload(Request $request)
    {
        $document = Document::orderBy('created_at', 'desc')->first();

        Storage::put($document->path, file_get_contents($request->file('file')));
    }
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Document::where('id', $id)->first();
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
            'file_name' => 'required',
            'category_id' => 'required|numeric',
            'file_removed' => 'required|boolean',
        ]);

        $document = Document::where('id', $id)->first();

        if($request->file_removed)
        {
            Storage::delete($document->path);
        }

        $category = Category::where('id', $request->category_id)->first();

        $document->file_name = $request->file_name;
        $document->category_id = $request->category_id;
        $document->path = '/pdf/'. $category->name . '/'. $request->file_name . '.pdf';

        $document->save();

        foreach ($request->tags as $key => $value) {
            $confirm_tag = Tag::where('name', $value)->first();
            if(!$confirm_tag)
            {
                $tag = new Tag;
                
                $tag->document_id = $document->id;
                $tag->name = $value;

                $tag->save();
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
        $document = Document::where('id', $id)->first();
        $tag = Tag::where('document_id', $document->id)->delete();

        // delete File
        Storage::delete($document->path);

        $document->delete();
    }
}
