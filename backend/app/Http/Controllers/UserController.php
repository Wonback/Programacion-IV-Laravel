<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __invoke()
    {
        return User::select('id', 'name', 'email', 'role', 'created_at')->paginate(20);
    }
}
