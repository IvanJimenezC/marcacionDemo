-- CreateEnum
CREATE TYPE "campaign_status_enum" AS ENUM ('draft', 'scheduled', 'running', 'paused', 'stopped', 'completed');

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overflows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "route_behavior" VARCHAR(50),
    "did" VARCHAR(20),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "skill_id" UUID,
    "overflow_id" UUID,
    "status" "campaign_status_enum" NOT NULL DEFAULT 'draft',
    "campaign_timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "wait_time_seconds" INTEGER NOT NULL DEFAULT 3600,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(150) NOT NULL,
    "additional_data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "lead_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "lead_profile_id" UUID NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "call_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "current_attempts" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP,

    CONSTRAINT "campaign_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "overflow_id" UUID,
    "disposition" VARCHAR(50),
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "talk_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "ivr_path" VARCHAR(255),
    "recording_url" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_test" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_campaigns_active" ON "campaigns"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_leads_marcador" ON "campaign_leads"("campaign_id", "call_status", "next_retry_at");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_leads_campaign_id_phone_number_key" ON "campaign_leads"("campaign_id", "phone_number");

-- CreateIndex
CREATE INDEX "idx_logs_lead_search" ON "call_logs"("lead_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_overflow_id_fkey" FOREIGN KEY ("overflow_id") REFERENCES "overflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_lead_profile_id_fkey" FOREIGN KEY ("lead_profile_id") REFERENCES "lead_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "campaign_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_overflow_id_fkey" FOREIGN KEY ("overflow_id") REFERENCES "overflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
