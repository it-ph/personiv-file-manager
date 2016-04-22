<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Document;
use App\Category;
use App\Tag;
use DB;
use App\Http\Requests;
use File;
use Storage;
use Response;

class DocumentController extends Controller
{
    public function search(Request $request)
    {
        return $document = DB::table('documents')
            ->join('tags', 'tags.document_id', '=', 'documents.id')
            ->select(
                '*',
                DB::raw('UPPER(LEFT(documents.file_name, 1)) as first_letter'),
                DB::raw('DATE_FORMAT(documents.created_at, "%b. %d, %Y") as created_at_formatted')
            )
            ->where('documents.file_name', 'like', '%'. $request->userInput .'%')
            ->where('tags.name', 'like', '%'. $request->userInput .'%')
            ->orderBy('documents.file_name')
            ->groupBy('documents.id')
            ->get();

            foreach ($document as $document_key => $document_value) {
                $tags = Tag::where('document_id', $document_value->id)->get();
                
                $document_value->tags = array();
                
                foreach ($tags as $tags_key => $tags_value) {
                    array_push($document_value->tags, $tags_value->name);
                }
            }
    }
    public function view($id)
    {
        $document = Document::where('id', $id)->first();

         // use question image_path to fetch the file
        $path = storage_path() .'/app/'. $document->path;

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
        //
    }
}
