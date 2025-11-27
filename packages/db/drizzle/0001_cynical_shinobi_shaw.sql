CREATE TYPE "public"."attribute_type" AS ENUM('select', 'color', 'size', 'text');--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "attribute_type" DEFAULT 'select' NOT NULL,
	"values" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attributes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category_attributes" (
	"category_id" text NOT NULL,
	"attribute_id" text NOT NULL,
	"required" integer DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_attributes_category_id_attribute_id_pk" PRIMARY KEY("category_id","attribute_id")
);
--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attributes_slug_idx" ON "attributes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "attributes_type_idx" ON "attributes" USING btree ("type");--> statement-breakpoint
CREATE INDEX "category_attributes_category_id_idx" ON "category_attributes" USING btree ("category_id");