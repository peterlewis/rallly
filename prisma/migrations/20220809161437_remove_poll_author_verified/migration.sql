-- Remove user relationship for unverified polls
UPDATE polls
SET user_id = ''
WHERE polls.verified = false;

-- Delete users that do not have any polls, participants or comments
DELETE FROM "users" u
WHERE NOT EXISTS (SELECT * FROM "polls" p WHERE u.id = p.user_id)
AND NOT EXISTS (SELECT * FROM "participants" pa WHERE u.id = pa.user_id)
AND NOT EXISTS (SELECT * FROM "comments" c WHERE u.id = c.user_id);

-- Remove author name because we now show user name or Guest
-- Remove verified because user_id not mapping to a user is the same as not verified
ALTER TABLE "polls" DROP COLUMN "author_name",
DROP COLUMN "verified";
