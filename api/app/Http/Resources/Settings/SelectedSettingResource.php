<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SelectedSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'setting' => [
                'id' => $this->setting->id,
                'key' => $this->setting->key,
                'type' => $this->setting->type,
                'label' => $this->setting->label,
                'description' => $this->setting->description,
                'defaultValueId' => $this->setting->default_setting_value_id,
            ],

            'value' => [
                'id' => $this->value->id,
                'value' => $this->value->value,
                'label' => $this->value->label,
                'meta' => $this->value->meta,
            ],
        ];
    }
}
