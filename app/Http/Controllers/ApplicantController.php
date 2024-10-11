<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Applicant;
use App\Models\User;

class ApplicantController extends Controller
{
    public function index()
    {
        return response()->json(Applicant::all());
    }
}
