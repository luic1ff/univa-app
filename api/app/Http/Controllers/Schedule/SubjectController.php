<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreSubjectRequest;
use App\Http\Requests\Schedule\UpdateSubjectRequest;
use App\Models\Schedule\Subject;
use App\Policies\Schedule\SubjectPolicy;
use App\Services\Schedule\SubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function __construct(
        private readonly SubjectService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $subjects = $this->service->listForUser((int) auth()->id());

        return ApiResponse::ok('Subjects retrieved.', $subjects);
    }

    /**
     * @throws UnivaHttpException
     */
    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = $this->service->create((int) auth()->id(), $request->validated());

        return ApiResponse::created('Subject created.', $subject);
    }

    /**
     * @throws UnivaHttpException
     */
    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);

        $updated = $this->service->update($subject, $request->validated());

        return ApiResponse::ok('Subject updated.', $updated);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorize('delete', $subject);

        $this->service->delete($subject);

        return ApiResponse::ok('Subject deleted.');
    }
}
