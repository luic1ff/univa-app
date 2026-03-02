<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'first_name'        => $this->first_name,
            'last_name'         => $this->last_name,
            'username'          => $this->username,
            'email'             => $this->email,
            'avatar_path' => $this->avatar_path
                ? url(Storage::url($this->avatar_path))
                : null,
            'email_verified_at' => $this->email_verified_at,
            'created_at'        => $this->created_at,
        ];
    }
}
