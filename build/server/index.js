import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, createCookieSessionStorage, redirect, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useLoaderData, redirect as redirect$1, Link, Form } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Authenticator } from "remix-auth";
import { DiscordStrategy, SocialsProvider, GitHubStrategy, GoogleStrategy } from "remix-auth-socials";
import { sql, eq, and, asc, inArray } from "drizzle-orm";
import { pgTable, serial, text, boolean, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import { useState, useRef, useCallback, useMemo, useEffect, Suspense } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const styles = "/assets/tailwind-DGA-qKsT.css";
const links = () => [
  { rel: "stylesheet", href: styles }
];
function Layout$1({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout: Layout$1,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    // use any name you want here
    sameSite: "lax",
    // this helps with CSRF
    path: "/",
    // remember to add this so the cookie will work in all routes
    httpOnly: true,
    // for security reasons, make this cookie http only
    secrets: ["wgg1rdsg13r1gr45g12rg31564gv1"],
    // replace this with an actual secret
    secure: process.env.NODE_ENV === "production"
    // enable this in prod only
  }
});
var Permission = /* @__PURE__ */ ((Permission2) => {
  Permission2["ADMIN"] = "admin";
  Permission2["USER"] = "user";
  return Permission2;
})(Permission || {});
var Platform = /* @__PURE__ */ ((Platform2) => {
  Platform2["DISCORD"] = "discord";
  Platform2["GITHUB"] = "github";
  Platform2["GOOGLE"] = "google";
  return Platform2;
})(Platform || {});
const account$1 = pgTable("account", {
  id: serial("user_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  link_avatar: text("link_avatar").notNull(),
  permissions: text("permissions", { enum: ["admin", "user"] }).default("user"),
  link_discord: boolean("link_discord").default(false),
  link_google: boolean("link_google").default(false),
  link_github: boolean("link_github").default(false)
});
const book = pgTable("book", {
  id: serial("id").primaryKey(),
  author_id: serial("author_id").references(() => account$1.id),
  title: text("title").default("Untitled"),
  cover: text("cover"),
  description: text("description").default("No description available"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  allow_comments: boolean("allow_comments").default(true),
  published: boolean("published").default(false),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow(),
  update_at: timestamp("update_at", { withTimezone: false }).defaultNow()
});
const chapter = pgTable(
  "chapter",
  {
    id: serial("id").primaryKey(),
    book_id: serial("book_id").references(() => book.id),
    title: text("title").default("Untitled"),
    content: text("content").array().default(sql`ARRAY[]::text[]`),
    chapter_id: integer("chapter_id").default(0)
  },
  (table) => ({
    unq: unique().on(table.book_id, table.chapter_id)
  })
);
pgTable("comment", {
  id: serial("id").primaryKey(),
  book_id: serial("book_id").references(() => book.id),
  user_id: serial("user_id").references(() => account$1.id),
  content: text("content").default(""),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow(),
  update_at: timestamp("update_at", { withTimezone: false }).defaultNow()
});
pgTable("like", {
  id: serial("id").primaryKey(),
  book_id: serial("book_id").references(() => book.id),
  user_id: serial("user_id").references(() => account$1.id),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow()
});
pgTable("follow", {
  id: serial("id").primaryKey(),
  follower_id: serial("follower_id").references(() => account$1.id),
  following_id: serial("following_id").references(() => account$1.id),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow()
});
const history$1 = pgTable("history", {
  id: serial("id").primaryKey(),
  book_id: serial("book_id").references(() => book.id),
  user_id: serial("user_id").references(() => account$1.id),
  chapter: integer("chapter").default(0),
  page: integer("page").default(0),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow()
}, (table) => ({
  unq: unique().on(table.book_id, table.user_id)
}));
dotenv.config();
const migrationsClient = postgres(process.env.SQL_CONNECTION_LINK || "", {
  max: 1
});
const db = drizzle(migrationsClient);
let authenticator = new Authenticator(sessionStorage);
const getCallback = (provider) => {
  return `https://test.pikacnu.com/auth/${provider}/callback`;
};
const newUser = async (profile) => {
  let user = {
    id: 0,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    provider: profile.provider,
    permissions: Permission.USER,
    link_account: [profile.provider]
  };
  const userdata = (await db.select().from(account$1).where(eq(account$1.email, profile.email)))[0];
  if (userdata) {
    user.permissions = userdata.permissions;
    user.id = userdata.id;
    user.link_account = [
      ...userdata.link_discord ? [Platform.DISCORD] : [],
      ...userdata.link_google ? [Platform.GOOGLE] : [],
      ...userdata.link_github ? [Platform.GITHUB] : []
    ];
    user.displayName = userdata.name;
    user.photoURL = userdata.link_avatar;
  }
  return user;
};
authenticator.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: getCallback(SocialsProvider.DISCORD),
      scope: ["identify", "email"]
    },
    async ({ profile }) => {
      await db.insert(account$1).values({
        name: profile.displayName,
        email: profile.emails[0].value,
        link_avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}.png`,
        link_discord: true
      }).onConflictDoUpdate({
        target: account$1.email,
        set: {
          link_discord: true
        }
      });
      return newUser({
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photoURL: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}.png`,
        provider: SocialsProvider.DISCORD
      });
    }
  )
);
authenticator.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: getCallback(SocialsProvider.GITHUB)
    },
    async ({ profile }) => {
      await db.insert(account$1).values({
        name: profile.displayName,
        email: profile.emails[0].value,
        link_avatar: profile.photos[0].value,
        link_github: true
      }).onConflictDoUpdate({
        target: [account$1.email],
        set: {
          link_github: true
        }
      });
      return newUser({
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photoURL: profile.photos[0].value,
        provider: SocialsProvider.GITHUB
      });
    }
  )
);
authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallback(SocialsProvider.GOOGLE)
    },
    async ({ profile }) => {
      await db.insert(account$1).values({
        name: profile.displayName,
        email: profile.emails[0].value,
        link_avatar: profile.photos[0].value,
        link_google: true
      }).onConflictDoUpdate({
        target: [account$1.email],
        set: {
          link_google: true
        }
      });
      return newUser({
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photoURL: profile.photos[0].value,
        provider: SocialsProvider.GOOGLE
      });
    }
  )
);
let loader$h = async ({ request, params }) => {
  return await authenticator.authenticate(params.provider || "", request, {
    successRedirect: "/home",
    failureRedirect: "/login"
  });
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$h
}, Symbol.toStringTag, { value: "Module" }));
const action$5 = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const data = await request.json();
  const { chapters, book_id } = data;
  const bookid = parseInt(book_id);
  const bookdata = (await db.select().from(book).where(and(eq(book.id, bookid), eq(book.author_id, user.id))))[0];
  if (!bookdata)
    return redirect("/edit");
  if (!chapters)
    return redirect("/edit");
  if (chapters.length === 0)
    return redirect("/");
  const originalChapters = await db.select().from(chapter).where(eq(chapter.book_id, book_id));
  const changeChapter = chapters.map((e, i) => {
    return Object.assign(e, { chapter_id: i });
  }).filter(
    (chapterdata) => {
      return !originalChapters.some(
        (originalChapter) => originalChapter.title === chapterdata.title && originalChapter.content === chapterdata.content && originalChapter.chapter_id === chapterdata.chapter_id
      );
    }
  );
  const updateDB = changeChapter.map(
    async (chapterdata) => {
      console.log(chapterdata, chapterdata.chapter_id);
      if (!chapterdata.title || !chapterdata.text)
        return;
      await db.insert(chapter).values({
        book_id: bookid,
        title: chapterdata.title,
        content: chapterdata.text,
        chapter_id: chapterdata.chapter_id
      }).onConflictDoUpdate({
        target: [chapter.book_id, chapter.chapter_id],
        set: {
          title: chapterdata.title,
          content: chapterdata.text,
          chapter_id: chapterdata.chapter_id
        },
        targetWhere: eq(chapter.chapter_id, chapterdata.chapter_id)
      });
    }
  );
  await Promise.all(updateDB);
  return {
    success: true
  };
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
function Reader({
  chapter: chapter2,
  chapter_index,
  page_index
}) {
  const [contorlPanelOpen, setContorlPanelOpen] = useState(false);
  const [device, setDevice] = useState(
    "undefined"
    /* undefind */
  );
  const [deviceWidth, setDeviceWidth] = useState(1920);
  const [deviceHeight, setDeviceHeight] = useState(1080);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(page_index.current || 0);
  const [textDirection, setTextDirection] = useState("ltr");
  const [bgcolor, setBgColor] = useState("#FFFFFF");
  const [currentChapter, setCurrentChapter] = useState(
    chapter_index.current || 0
  );
  const changeChapterCheck = useRef(false);
  const complementaryColor = useCallback((color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 2 + 2), 16);
    const b = parseInt(hex.substring(4, 4 + 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
    return yiq >= 128 ? "#000000" : "#FFFFFF";
  }, []);
  const textcolor = useMemo(
    () => complementaryColor(bgcolor),
    [complementaryColor, bgcolor]
  );
  const fontMaxSize = 24;
  const fontMinSize = 12;
  const [fontsize, setFontsize] = useState(16);
  const changeFontsize = useCallback((size) => {
    setFontsize(
      size > fontMaxSize ? fontMaxSize : size < fontMinSize ? fontMinSize : size
    );
  }, []);
  const [searching, setSearching] = useState(false);
  const [searchingText, setSearchingText] = useState("");
  const [textLeading, setTextLeading] = useState(2);
  const textLeadingMax = 4.5;
  const textLeadingMin = 1;
  const changeTextLeading = useCallback((size) => {
    setTextLeading(
      size > textLeadingMax ? textLeadingMax : size < textLeadingMin ? textLeadingMin : size
    );
  }, []);
  const textLead = useMemo(() => `${textLeading / 2}em`, [textLeading]);
  const sampleTextLead = useMemo(() => `${textLeading}em`, [textLeading]);
  const textcoverter = useCallback((text2, direction) => {
    const textConverterTable = /* @__PURE__ */ new Map();
    if (direction === "rtl")
      return text2;
    return text2 === "" ? "" : text2.split("").reduce((acc, cur) => {
      const converted = textConverterTable.get(cur);
      return acc + (converted ? converted : cur);
    });
  }, []);
  const pages = useMemo(() => {
    const verticalTextCount = Math.floor(deviceHeight / textHeight);
    const horizontalTextCount = Math.floor(deviceWidth / textWidth) - (device === "desktop" ? 3 : 1);
    const lines = [chapter2.pages[currentChapter]].reduce(
      (acc, cur) => {
        let currentLine = cur.content.reduce(
          (acc2, cur2) => {
            if (cur2.length > verticalTextCount) {
              const lines2 = cur2.split("").reduce(
                (acc3, cur3) => {
                  if (acc3[acc3.length - 1].length < verticalTextCount) {
                    acc3[acc3.length - 1] += cur3;
                    return acc3;
                  }
                  return [...acc3, cur3];
                },
                [""]
              );
              return [...acc2, ...lines2];
            }
            return [...acc2, cur2];
          },
          [""]
        );
        return [...acc, ...currentLine];
      },
      [""]
    );
    const pages2 = lines.reduce(
      (acc, cur) => {
        if (acc.length === 0)
          return [[cur]];
        const lastPage = acc[acc.length - 1];
        if (lastPage.length < horizontalTextCount) {
          lastPage.push(cur);
          return acc;
        }
        return [...acc, [cur]];
      },
      [[""]]
    );
    return pages2;
  }, [
    chapter2,
    deviceWidth,
    deviceHeight,
    textWidth,
    textHeight,
    fontsize,
    currentChapter
  ]);
  useEffect(() => {
    setDevice(
      window.innerWidth < 640 ? "mobile" : window.innerWidth < 1920 ? "tablet" : "desktop"
      /* desktop */
    );
    setTimeout(() => {
      sizeSet();
    }, 1e3);
  }, []);
  useEffect(() => {
    const handleKeydown = (e) => {
      var _a, _b, _c, _d;
      if (e.key === "ArrowRight") {
        if (currentPage === 0 && currentChapter === 0)
          return;
        if (currentChapter === 0) {
          if (page_index)
            page_index.current = currentPage - 1;
          setCurrentPage((prev) => prev - 1);
        }
        if (!changeChapterCheck.current) {
          (_a = document.getElementById("changeChapter")) == null ? void 0 : _a.removeAttribute("hidden");
          return changeChapterCheck.current = true;
        }
        changeChapterCheck.current = false;
        (_b = document.getElementById("changeChapter")) == null ? void 0 : _b.setAttribute("hidden", "");
        setCurrentPage(0);
        setCurrentChapter((prev) => prev - 1);
        if (page_index)
          page_index.current = 0;
        if (chapter_index)
          chapter_index.current = currentChapter - 1;
        return;
      }
      if (e.key === "ArrowLeft") {
        if (chapter2.pages.length === currentChapter + 1 && !(currentPage === pages.length - 1)) {
          if (page_index)
            page_index.current = currentPage + 1;
          return setCurrentPage((prev) => prev + 1);
        }
        if (currentPage === pages.length - 1 && chapter2.pages.length !== currentChapter + 1) {
          if (!changeChapterCheck.current) {
            (_c = document.getElementById("changeChapter")) == null ? void 0 : _c.removeAttribute("hidden");
            return changeChapterCheck.current = true;
          }
          changeChapterCheck.current = false;
          (_d = document.getElementById("changeChapter")) == null ? void 0 : _d.setAttribute("hidden", "");
          setCurrentPage(0);
          setCurrentChapter((prev) => prev + 1);
          if (page_index)
            page_index.current = 0;
          if (chapter_index)
            chapter_index.current = currentChapter + 1;
          return;
        }
        if (currentPage === pages.length - 1)
          return;
        return setCurrentPage((prev) => prev + 1);
      }
      if (e.key === "Control")
        return setContorlPanelOpen((prev) => !prev);
    };
    const handleClick = (event) => {
      var _a;
      handleKeydown({ key: ((_a = event.currentTarget) == null ? void 0 : _a.id) || "" });
    };
    document.addEventListener("keydown", handleKeydown);
    const elements = document.getElementsByClassName("Touch");
    for (const element of elements) {
      element.addEventListener("click", handleClick);
    }
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      const elements2 = document.getElementsByClassName("Touch");
      for (const element of elements2) {
        element.removeEventListener("click", handleClick);
      }
    };
  }, [currentPage, pages, textWidth, textHeight, deviceHeight, device]);
  const sizeSet = useCallback(() => {
    var _a, _b;
    setDeviceWidth(window.innerWidth);
    setDeviceHeight(window.innerHeight);
    setTextWidth(
      Math.floor(
        (((_a = document.getElementById("textsize")) == null ? void 0 : _a.getBoundingClientRect().width) || 0) / 2
      )
    );
    setTextHeight(
      Math.floor(
        (((_b = document.getElementById("textsize")) == null ? void 0 : _b.getBoundingClientRect().height) || 0) / 2
      )
    );
  }, []);
  useEffect(() => {
    window.addEventListener("resize", () => {
      sizeSet();
    });
    return () => {
      window.removeEventListener("resize", () => {
        sizeSet();
      });
    };
  }, [deviceHeight, deviceWidth, textHeight, textWidth]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex flex-col w-full h-svh overflow-hidden",
      style: { backgroundColor: bgcolor, color: textcolor, fontSize: fontsize },
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute bg-yellow-400 m-2 p-2 rounded-full", id: "changeChapter", hidden: true, children: "即將更換章節" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            id: "textsize",
            className: "flex w-min h-min absolute invisible pr-8 pl-8 *:m-0 *:p-0",
            style: textDirection === "ltr" ? {
              marginLeft: sampleTextLead,
              marginRight: sampleTextLead
            } : {
              marginTop: sampleTextLead,
              marginBottom: sampleTextLead
            },
            children: [
              /* @__PURE__ */ jsx("p", { children: "你好" }),
              /* @__PURE__ */ jsx("p", { children: "世界" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            id: "textsize-en-s",
            className: "flex w-min h-min absolute invisible pr-8 pl-8 *:m-0 *:p-0",
            style: textDirection === "ltr" ? {
              marginLeft: sampleTextLead,
              marginRight: sampleTextLead
            } : {
              marginTop: sampleTextLead,
              marginBottom: sampleTextLead
            },
            children: [
              /* @__PURE__ */ jsx("p", { children: "rr" }),
              /* @__PURE__ */ jsx("p", { children: "rr" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            id: "textsize-en-b",
            className: "flex w-min h-min absolute invisible pr-8 pl-8 *:m-0 *:p-0",
            style: textDirection === "ltr" ? {
              marginLeft: sampleTextLead,
              marginRight: sampleTextLead
            } : {
              marginTop: sampleTextLead,
              marginBottom: sampleTextLead
            },
            children: [
              /* @__PURE__ */ jsx("p", { children: "RR" }),
              /* @__PURE__ */ jsx("p", { children: "RR" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink flex-grow flex relative", children: [
          device !== "desktop" ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "w-full h-full *:w-1/3 *:h-full absolute flex flex-row", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                id: "ArrowLeft",
                className: "Touch"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                id: "Control",
                className: "Touch"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                id: "ArrowRight",
                className: "Touch"
              }
            )
          ] }) }) : /* @__PURE__ */ jsx(Fragment, {}),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `text-${textDirection} mt-4 w-full flex flex-warp ${textDirection === "rtl" ? "flex-col" : "flex-col-reverse"}`,
              children: pages[currentPage].map((item, index) => {
                const text2 = textcoverter(item.toString(), textDirection);
                return /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: Object.assign(
                      searching && searchingText ? {
                        backgroundColor: text2.includes(searchingText) ? textcolor : "transparent",
                        color: text2.includes(searchingText) ? bgcolor : textcolor
                      } : {},
                      textDirection === "ltr" ? {
                        marginLeft: textLead,
                        marginRight: textLead
                      } : {
                        marginTop: textLead,
                        marginBottom: textLead
                      }
                    ),
                    children: text2
                  },
                  index
                );
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex flex-row h-8 items-center justify-center *:m-2 text-lg`,
            children: /* @__PURE__ */ jsxs("p", { children: [
              currentPage + 1,
              "/",
              pages.length
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex flex-row w-full justify-center *:ml-2 *:mr-2 p-2 text-lg bg-slate-400 flex-wrap ${contorlPanelOpen ? "" : "hidden"}`,
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setTextDirection(textDirection === "ltr" ? "rtl" : "ltr"),
                  children: textDirection
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "color",
                  value: bgcolor,
                  className: "all-unset w-8 h-8",
                  onChange: (e) => setBgColor(e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  value: fontsize,
                  min: fontMinSize,
                  max: fontMaxSize,
                  className: "w-16 h-8",
                  onChange: (e) => changeFontsize(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: searchingText,
                    onChange: (e) => setSearchingText(e.target.value),
                    className: "w-32 bg-transparent border-b-2 border-gray-500"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      setSearching((prev) => !prev);
                    },
                    className: "w-16",
                    children: searching ? "searching" : "search"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  value: textLeading,
                  min: textLeadingMin,
                  max: textLeadingMax,
                  step: 0.1,
                  onChange: (e) => changeTextLeading(Number(e.target.value))
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const loader$g = async ({ params, request }) => {
  const searchparams = new URLSearchParams(request.url.split("?")[1]);
  const chapterid = searchparams.get("chapterid");
  const page = searchparams.get("page");
  const bookid = parseInt(params.bookid);
  const bookdata = await db.select({
    book_name: book.title
  }).from(book).where(and(eq(book.id, bookid), eq(book.published, true)));
  if (bookdata.length === 0) {
    return redirect$1("/404");
  }
  return {
    data: {
      pages: await db.select({
        content: chapter.content,
        title: chapter.title,
        pageIndex: chapter.chapter_id
      }).from(chapter).where(eq(chapter.book_id, bookid))
    },
    book: {
      title: bookdata[0].book_name,
      id: bookid
    },
    chapterid,
    page
  };
};
const meta$6 = ({ data }) => {
  return [
    { title: `Reader - ${data == null ? void 0 : data.book.title}` },
    { name: "description", content: "" }
  ];
};
function Index$2() {
  const data = useLoaderData();
  const chapterIndex = useRef(parseInt(data.chapterid || "") || 0);
  const pageIndex = useRef(parseInt(data.page || "") || 0);
  const chapterData = data.data;
  useEffect(() => {
    window.setInterval(() => {
      fetch("/api/history", {
        method: "POST",
        body: JSON.stringify({
          bookid: data.book.id,
          chapter: chapterIndex.current,
          page: pageIndex.current
        })
      }).then((res) => res.json()).then((data2) => console.log(data2)).catch((err) => console.error(err));
    }, 1 * 60 * 1e3);
    return () => {
      fetch("/api/history", {
        method: "POST",
        body: JSON.stringify({
          bookid: data.book.id,
          chapter: chapterIndex.current,
          page: pageIndex.current
        })
      }).then((res) => res.json()).then((data2) => console.log(data2)).catch((err) => console.error(err));
    };
  }, [data.page, data.chapterid]);
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full m-0", children: /* @__PURE__ */ jsx(
    Reader,
    {
      chapter: chapterData,
      chapter_index: chapterIndex,
      page_index: pageIndex
    }
  ) });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$2,
  loader: loader$g,
  meta: meta$6
}, Symbol.toStringTag, { value: "Module" }));
const List = "data:image/svg+xml,%3csvg%20width='96'%20height='96'%20viewBox='0%200%2096%2096'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_47_2)'%3e%3cpath%20d='M12%2052H20V44H12V52ZM12%2068H20V60H12V68ZM12%2036H20V28H12V36ZM28%2052H84V44H28V52ZM28%2068H84V60H28V68ZM28%2028V36H84V28H28Z'%20fill='black'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_47_2'%3e%3crect%20width='96'%20height='96'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
function Text({
  value,
  setvalue,
  disable
}) {
  const [text2, setText] = useState(value || "");
  const [editing, setEditing] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-row", children: [
    /* @__PURE__ */ jsx("div", { children: editing && disable ? /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: text2,
        onChange: (e) => setText(e.currentTarget.value)
      }
    ) : /* @__PURE__ */ jsx("p", { children: text2 }) }),
    /* @__PURE__ */ jsx("div", { children: disable ? /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setEditing(!editing);
          setvalue(text2);
        },
        children: editing ? `Save` : `Edit`
      }
    ) : "" })
  ] });
}
function View({
  getEditor,
  defaultdata
}) {
  const editor = useCreateBlockNote(
    {
      defaultStyles: true,
      initialContent: defaultdata
    }
  );
  useEffect(() => {
    getEditor(editor);
  }, []);
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    BlockNoteView,
    {
      editor,
      sideMenu: false,
      slashMenu: false,
      linkToolbar: false,
      tableHandles: false,
      formattingToolbar: false
    }
  ) });
}
const loader$f = async ({ params, request }) => {
  const { bookid } = params;
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const bookdata = (await db.select().from(book).where(
    and(eq(book.id, parseInt(bookid || "0")), eq(book.author_id, user.id))
  ))[0];
  if (!bookdata)
    return redirect("/edit");
  const chpaters = await db.select({
    title: chapter.title,
    content: chapter.content
  }).from(chapter).where(eq(chapter.book_id, parseInt(bookid || "0")));
  if (chpaters.length === 0) {
    return { chapters: null, book_id: bookid };
  }
  const chapters = chpaters.map((data) => {
    return {
      title: data.title || "",
      text: data.content || []
    };
  });
  return { chapters, book_id: bookid };
};
function Editor() {
  const { chapters, book_id } = useLoaderData();
  const [chapterTabOpen, setChapterTabOpen] = useState(false);
  const [chapterList, setChapterList] = useState(
    chapters ? chapters : [
      {
        title: "Chapter 1",
        text: [""]
      }
    ]
  );
  useEffect(() => {
    console.log(chapterList);
  }, [chapterList]);
  const [editing, setEditing] = useState(0);
  const [editorLoad, setEditorLoad] = useState(false);
  const editor = useRef();
  const time = useRef((/* @__PURE__ */ new Date()).getTime());
  useEffect(() => {
    const interval = setInterval(() => {
      if ((/* @__PURE__ */ new Date()).getTime() - time.current > 1e3 * 60 * 1) {
        time.current = (/* @__PURE__ */ new Date()).getTime();
        const texts = blockToText();
        setChapterList((prev) => [
          ...prev.slice(0, editing),
          {
            title: prev[editing].title,
            text: texts || [""]
          },
          ...prev.slice(editing + 1, prev.length)
        ]);
        fetch("/api/book/content/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chapters: [
              ...chapterList.slice(0, editing),
              {
                title: chapterList[editing].title,
                text: texts || [""]
              },
              ...chapterList.slice(editing + 1, chapterList.length)
            ],
            book_id
          })
        }).then((res) => {
          res.json().then((data) => {
            console.log(data);
          });
        });
      }
    }, 1 * 60 * 1e3);
    return () => {
      clearInterval(interval);
    };
  }, [chapterList]);
  const blockToText = useCallback(() => {
    var _a, _b, _c, _d, _e;
    console.log((_a = editor.current) == null ? void 0 : _a.document);
    return (((_b = editor.current) == null ? void 0 : _b.document.length) === 1 ? (_c = editor.current) == null ? void 0 : _c.document : (_e = editor.current) == null ? void 0 : _e.document.slice(0, ((_d = editor.current) == null ? void 0 : _d.document.length) - 1)).map(
      (e) => (
        // @ts-ignore
        e.content.length === 0 ? "" : (
          // @ts-ignore
          e.content[0].text.includes("\n") ? (
            // @ts-ignore
            e.content[0].text.split("\n")
          ) : (
            // @ts-ignore
            e.content[0].text
          )
        )
      )
    );
  }, [editorLoad]);
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-row justify-center relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "absolute top-0 left-0",
        onClick: () => setChapterTabOpen(!chapterTabOpen),
        children: /* @__PURE__ */ jsx(
          "img",
          {
            className: "h-8 w-8 object-cover overflow-hidden",
            src: List,
            alt: "Open Chapter List"
          }
        )
      }
    ),
    chapterTabOpen ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "w-1/4 bg-yellow-200 h-full pt-8 flex flex-col", children: [
      chapterList.map((item, index) => {
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              var _a, _b;
              if (editing === index)
                return;
              e.preventDefault();
              const texts = blockToText();
              setChapterList((prev) => [
                ...prev.slice(0, editing),
                {
                  title: prev[editing].title,
                  text: texts || [""]
                },
                ...prev.slice(editing + 1, prev.length)
              ]);
              setEditing(index);
              (_b = editor.current) == null ? void 0 : _b.removeBlocks((_a = editor.current) == null ? void 0 : _a.document);
              item.text.map(
                (text2) => {
                  var _a2;
                  return (_a2 = editor.current) == null ? void 0 : _a2.insertBlocks(
                    [
                      {
                        type: "paragraph",
                        content: [text2]
                      }
                    ],
                    editor.current.document[editor.current.document.length === 0 ? 0 : editor.current.document.length - 1]
                  );
                }
              );
            },
            className: editing === index ? "bg-yellow-300" : "bg-yellow-200",
            children: /* @__PURE__ */ jsx(
              Text,
              {
                value: item.title,
                disable: index === editing,
                setvalue: (text2) => {
                  setChapterList((prev) => [
                    ...prev.slice(0, index),
                    {
                      title: text2,
                      text: prev[index].text
                    },
                    ...prev.slice(index + 1, prev.length)
                  ]);
                }
              }
            )
          },
          index
        );
      }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "w-full",
          onClick: () => {
            var _a, _b, _c;
            if (chapterList.length === 0) {
              return setChapterList([
                {
                  title: "Chapter 1",
                  text: ((_a = editor.current) == null ? void 0 : _a.document) || [""]
                }
              ]);
            }
            const texts = blockToText();
            setChapterList((prev) => [
              ...prev.slice(0, editing),
              {
                title: prev[editing].title,
                text: texts || [""]
              },
              ...prev.slice(editing + 1, prev.length),
              {
                title: `Chapter ${chapterList.length + 1}`,
                text: [""]
              }
            ]);
            setEditing(chapterList.length);
            (_c = editor.current) == null ? void 0 : _c.removeBlocks((_b = editor.current) == null ? void 0 : _b.document);
          },
          children: "+"
        }
      )
    ] }) }) : "",
    /* @__PURE__ */ jsx("div", { className: "w-3/4 h-full", children: /* @__PURE__ */ jsx(Suspense, { children: /* @__PURE__ */ jsx(
      View,
      {
        defaultdata: chapterList[editing].text.map((text2) => {
          return {
            type: "paragraph",
            content: [text2]
          };
        }),
        getEditor: (data) => {
          editor.current = data;
          setEditorLoad(true);
        }
      }
    ) }) })
  ] });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Editor,
  loader: loader$f
}, Symbol.toStringTag, { value: "Module" }));
function BookInfo({
  bookinfo,
  author_link
}) {
  const { title, author, cover, tags, chapters, description } = bookinfo;
  return /* @__PURE__ */ jsx("div", { className: "m-4 relative w-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-row-3 lg:grid-cols-3 min-h-[50vh] mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx(
        "img",
        {
          className: "object-cover",
          src: cover || "",
          alt: "Book Cover"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col grid-cols-subgrid row-span-2 lg:col-span-2 *:m-2", children: [
        /* @__PURE__ */ jsxs("h1", { className: "*:inline-block", children: [
          "Book Title : ",
          /* @__PURE__ */ jsx("p", { children: title })
        ] }),
        author_link ? /* @__PURE__ */ jsxs(
          Link,
          {
            className: "*:inline-block",
            to: author_link,
            children: [
              "Author : ",
              /* @__PURE__ */ jsx("p", { children: author })
            ]
          }
        ) : /* @__PURE__ */ jsxs("h2", { className: "*:inline-block", children: [
          "Author : ",
          /* @__PURE__ */ jsx("p", { children: author })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsx("p", { children: "Tags: " }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap ", children: (tags ? tags : []).map((tag, index) => {
            return /* @__PURE__ */ jsx(
              "p",
              {
                className: "border border-gray-200 ml-2",
                children: tag !== "" && tag !== void 0 ? tag : ""
              },
              index
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col m-2 p-2 border h-full w-max", children: [
          /* @__PURE__ */ jsx("p", { children: "Description : " }),
          /* @__PURE__ */ jsx("p", { children: (description || "").split("\n").map((line) => {
            return /* @__PURE__ */ jsx("p", { children: line }, line);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsx("br", {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsx("p", { children: "Chapters" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col m-2 *:p-2", children: (chapters ? chapters : []).map((chapter2, index) => {
        return /* @__PURE__ */ jsx(
          Link,
          {
            to: chapter2.link + `?chapterid=${index}`,
            className: "\n                  shadow-slate-300 hover:shadow-lg  border m-2 p-2\n                  ",
            children: `${chapter2.title}`
          },
          index
        );
      }) })
    ] })
  ] }) });
}
const sad = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20version='1.1'%20width='256'%20height='256'%20viewBox='0%200%20256%20256'%20xml:space='preserve'%3e%3cdefs%3e%3c/defs%3e%3cg%20style='stroke:%20none;%20stroke-width:%200;%20stroke-dasharray:%20none;%20stroke-linecap:%20butt;%20stroke-linejoin:%20miter;%20stroke-miterlimit:%2010;%20fill:%20none;%20fill-rule:%20nonzero;%20opacity:%201;'%20transform='translate(1.4065934065934016%201.4065934065934016)%20scale(2.81%202.81)'%20%3e%3cpath%20d='M%2045%2090%20C%2020.187%2090%200%2069.813%200%2045%20C%200%2020.187%2020.187%200%2045%200%20c%2024.813%200%2045%2020.187%2045%2045%20C%2090%2069.813%2069.813%2090%2045%2090%20z%20M%2045%204%20C%2022.393%204%204%2022.393%204%2045%20s%2018.393%2041%2041%2041%20s%2041%20-18.393%2041%20-41%20S%2067.607%204%2045%204%20z'%20style='stroke:%20none;%20stroke-width:%201;%20stroke-dasharray:%20none;%20stroke-linecap:%20butt;%20stroke-linejoin:%20miter;%20stroke-miterlimit:%2010;%20fill:%20rgb(0,0,0);%20fill-rule:%20nonzero;%20opacity:%201;'%20transform='%20matrix(1%200%200%201%200%200)%20'%20stroke-linecap='round'%20/%3e%3ccircle%20cx='30.344'%20cy='33.274'%20r='5.864'%20style='stroke:%20none;%20stroke-width:%201;%20stroke-dasharray:%20none;%20stroke-linecap:%20butt;%20stroke-linejoin:%20miter;%20stroke-miterlimit:%2010;%20fill:%20rgb(0,0,0);%20fill-rule:%20nonzero;%20opacity:%201;'%20transform='%20matrix(1%200%200%201%200%200)%20'/%3e%3ccircle%20cx='59.663999999999994'%20cy='33.274'%20r='5.864'%20style='stroke:%20none;%20stroke-width:%201;%20stroke-dasharray:%20none;%20stroke-linecap:%20butt;%20stroke-linejoin:%20miter;%20stroke-miterlimit:%2010;%20fill:%20rgb(0,0,0);%20fill-rule:%20nonzero;%20opacity:%201;'%20transform='%20matrix(1%200%200%201%200%200)%20'/%3e%3cpath%20d='M%2072.181%2065.49%20c%20-0.445%200%20-0.893%20-0.147%20-1.265%20-0.451%20c%20-7.296%20-5.961%20-16.5%20-9.244%20-25.916%20-9.244%20c%20-9.417%200%20-18.62%203.283%20-25.916%209.244%20c%20-0.854%200.7%20-2.115%200.572%20-2.814%20-0.283%20c%20-0.699%20-0.855%20-0.572%20-2.115%200.283%20-2.814%20C%2024.561%2055.398%2034.664%2051.795%2045%2051.795%20c%2010.336%200%2020.438%203.604%2028.447%2010.146%20c%200.855%200.699%200.982%201.959%200.283%202.814%20C%2073.335%2065.239%2072.76%2065.49%2072.181%2065.49%20z'%20style='stroke:%20none;%20stroke-width:%201;%20stroke-dasharray:%20none;%20stroke-linecap:%20butt;%20stroke-linejoin:%20miter;%20stroke-miterlimit:%2010;%20fill:%20rgb(0,0,0);%20fill-rule:%20nonzero;%20opacity:%201;'%20transform='%20matrix(1%200%200%201%200%200)%20'%20stroke-linecap='round'%20/%3e%3c/g%3e%3c/svg%3e";
const loader$e = async ({ params }) => {
  const bookid = params.bookid;
  const bookdata = ((data) => {
    if (!data)
      return null;
    return [
      Object.assign(data.book, { author: data.account.name || "" }),
      data.account.id
    ];
  })(
    (await db.select().from(book).innerJoin(account$1, eq(book.author_id, account$1.id)).where(eq(book.id, parseInt(bookid || "0"))))[0]
  );
  const chapters = await db.select({
    title: chapter.title,
    content: chapter.content,
    chapter_id: chapter.chapter_id
  }).from(chapter).where(eq(chapter.book_id, parseInt(bookid || "0")));
  if (chapters.length === 0) {
    return { bookid, bookdata: null, author_id: bookdata[1] };
  }
  return json({
    bookid: params.bookid,
    bookdata: Object.assign(bookdata[0], {
      chapters: chapters.map((e) => {
        return Object.assign(e, { link: `/book/reader/${bookid}` });
      })
    }),
    author_id: bookdata[1]
  });
};
function Book() {
  const { bookid, bookdata, author_id } = useLoaderData();
  if (!bookdata) {
    return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "shadow-lg shadow-slate-300 p-4 rounded-md flex flex-row", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          className: "object-scale-down h-32 w-32",
          src: sad,
          alt: "Sad Face"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center ml-8 text-lg", children: /* @__PURE__ */ jsx("p", { children: "Book Not Found" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsx(
    BookInfo,
    {
      bookinfo: bookdata,
      author_link: "/user/" + author_id
    }
  );
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Book,
  loader: loader$e
}, Symbol.toStringTag, { value: "Module" }));
const loader$d = async ({ request, params }) => {
  const logindata = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });
  if (!logindata) {
    return { bookdata: null, userdata: null, chapters: null };
  }
  const bookid = parseInt(params.bookid);
  if (!bookid)
    return { bookdata: null, userdata: null, chapters: null };
  const bookdata = (await db.select().from(book).where(and(eq(book.id, bookid), eq(book.author_id, logindata.id))))[0];
  if (!bookdata)
    return { bookdata: null, userdata: null, chapters: null };
  const chapters = await db.select({
    title: chapter.title,
    content: chapter.content
  }).from(chapter).where(eq(chapter.book_id, bookid));
  if (chapters.length === 0) {
    return { bookdata, userdata: logindata, chapters: null };
  }
  return { bookdata, userdata: logindata, chapters };
};
const meta$5 = ({ data }) => {
  var _a;
  return [
    {
      title: `Laganto - Edit - ${((_a = data == null ? void 0 : data.bookdata) == null ? void 0 : _a.title) || ""}`
    }
  ];
};
function EditBook() {
  var _a;
  const { bookdata, userdata, chapters } = useLoaderData();
  const [title, setTitle] = useState(bookdata == null ? void 0 : bookdata.title);
  const [cover, setCover] = useState(bookdata == null ? void 0 : bookdata.cover);
  const coverClass = useRef(null);
  const [tags, setTags] = useState((_a = bookdata == null ? void 0 : bookdata.tags) == null ? void 0 : _a.join(","));
  const [published, setPublished] = useState(bookdata == null ? void 0 : bookdata.published);
  const [allowComment, setAllowComment] = useState(bookdata == null ? void 0 : bookdata.allow_comments);
  const [description, setDescription] = useState(bookdata == null ? void 0 : bookdata.description);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "bg-green-200 absolute",
        hidden: true,
        children: /* @__PURE__ */ jsx("p", { className: "bg-red-200" })
      }
    ),
    bookdata ? /* @__PURE__ */ jsxs("div", { className: "flex flex-row w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-1/3 item-center", children: [
        [
          {
            nane: "title",
            default: title,
            setvalue: setTitle
          },
          {
            nane: "cover",
            default: cover,
            setvalue: (cover2) => {
              setCover(cover2);
              if (cover2.match(
                /^(http|https):\/\/[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,4}/
              )) {
                coverClass.current = "outline-green-300";
                return;
              }
              coverClass.current = "outline-red-300";
            }
          },
          {
            nane: "tags",
            default: tags,
            setvalue: setTags
          },
          {
            nane: "description",
            default: description,
            setvalue: setDescription
          }
        ].map((data, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex flex-col *:w-full *:outline-1  *:m-2",
            children: [
              /* @__PURE__ */ jsx("label", { children: data.nane }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: `bg-gray-200 p-2 rounded-lg ${data.nane === "cover" ? coverClass.current : "outline-teal-300"}`,
                  type: "text",
                  value: data.default || "",
                  onChange: (e) => {
                    data.setvalue(e.currentTarget.value);
                  }
                }
              ),
              /* @__PURE__ */ jsx("hr", {})
            ]
          },
          index
        )),
        /* @__PURE__ */ jsxs("div", { className: "*:m-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `bg-${published ? "green" : "red"}-200`,
                onClick: () => setPublished((prev) => !prev),
                children: published ? "Published" : "Unpublished"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `bg-${allowComment ? "green" : "red"}-200`,
                onClick: () => setAllowComment((prev) => !prev),
                children: allowComment ? "Allow Comment" : "Disallow Comment"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 *:text-center", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  fetch(`/api/book/save`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    redirect: "follow",
                    body: JSON.stringify({
                      id: bookdata.id,
                      title,
                      cover,
                      tags,
                      description,
                      author_id: userdata.id,
                      published,
                      allow_comments: allowComment
                    })
                  }).then((res) => {
                    if (res.redirected) {
                      window.location.href = res.url;
                      return;
                    }
                    res.json().then((data) => {
                      if (data.success === true)
                        alert("Saved");
                    });
                  });
                },
                children: "Save BookInfo"
              }
            ),
            /* @__PURE__ */ jsx(Link, { to: `/editor/${bookdata.id}`, children: "Edit Chapter" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-2/3", children: /* @__PURE__ */ jsx(
        BookInfo,
        {
          bookinfo: {
            title: title || "",
            cover: cover || "",
            tags: (tags == null ? void 0 : tags.split(",")) || [],
            description: description || "",
            author: userdata.displayName || "",
            chapters: (chapters == null ? void 0 : chapters.map((e) => ({ title: e.title || "", link: "" }))) || []
          }
        }
      ) })
    ] }) : /* @__PURE__ */ jsx("div", { children: "Book not found" })
  ] });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EditBook,
  loader: loader$d,
  meta: meta$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$c = async ({ request }) => {
  const userdata = await authenticator.isAuthenticated(request);
  if (!userdata) {
    return { books: null };
  }
  const book_data = await db.select().from(book).where(eq(book.author_id, userdata.id));
  if (book_data.length === 0) {
    return { books: null };
  }
  const books = book_data.map((data) => {
    return {
      cover: data.cover || "",
      title: data.title || "",
      tags: data.tags || [],
      src: `/book/edit/${data.id}`,
      author: userdata.displayName,
      id: data.id
    };
  });
  return { books };
};
const meta$4 = () => {
  return [{ title: "Laganto - Edit Books" }];
};
function Edit() {
  const { books } = useLoaderData();
  if (!books) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-full", children: /* @__PURE__ */ jsx(
      "button",
      {
        className: " outline outline-gray-400 p-4 shadow-xl rounded-3xl text-2xl",
        onClick: () => {
          fetch(`/api/book/edit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            redirect: "follow",
            body: JSON.stringify({ id: -1 })
          }).then((res) => {
            if (res.redirected) {
              window.location.href = res.url;
            }
          });
        },
        children: "Create A Book"
      }
    ) });
  }
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 :grid-cols-6 gap-2", children: books.map((book2, index) => {
    const { title, author, cover, src, tags, id } = book2;
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex items-center justify-center w-full h-full",
        children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              fetch(`/api/book/edit`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                redirect: "follow",
                body: JSON.stringify({ id })
              }).then((res) => {
                if (res.redirected) {
                  window.location.href = res.url;
                }
              });
            },
            className: `flex flex-col p-4 border-gray-200 border w-32 h-48 *:m-0
				md:flex-row md:w-96 md:h-48 md:*:p-2 
				shadow-slate-300 hover:shadow-xl hover:border-0`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "h-2/3 w-full min-w-24 md:w-1/2 md:h-full", children: /* @__PURE__ */ jsx(
                "img",
                {
                  className: "h-full w-full object-cover overflow-hidden ",
                  src: cover,
                  alt: `${title} Cover`
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-rows-4 md:w-1/2", children: [
                /* @__PURE__ */ jsx("p", { children: title }),
                /* @__PURE__ */ jsx("p", { children: author }),
                /* @__PURE__ */ jsx("div", { className: "h-min grid-rows-subgrid row-span-2 flex flex-wrap overflow-hidden", children: tags == null ? void 0 : tags.slice(0, 6).map((tag, index2) => {
                  return /* @__PURE__ */ jsx(
                    "p",
                    {
                      className: "border  border-gray-200",
                      children: tag
                    },
                    index2
                  );
                }) })
              ] })
            ]
          }
        )
      },
      index
    );
  }) }) });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Edit,
  loader: loader$c,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
async function loader$b() {
  return redirect("/login");
}
async function action$4({ request, params }) {
  if (!params.provider)
    return redirect("/login");
  return await authenticator.authenticate(params.provider, request);
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
const action$3 = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const id = (await request.json()).id;
  if (id === -1) {
    const data = (await db.insert(book).values({
      title: "New Book",
      author_id: user.id,
      cover: "",
      tags: []
    }).returning({ id: book.id }))[0];
    return redirect(`/edit/${data.id}`);
  }
  return redirect(`/edit/${id}`);
};
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const { id, title, cover, tags, description, published, allow_comments } = await request.json();
  if (!id) {
    return redirect("/edit");
  }
  const book_data = await db.select().from(book).where(eq(book.id, id));
  if (book_data.length === 0) {
    return redirect("/edit");
  }
  if (book_data[0].author_id !== user.id) {
    return redirect("/edit");
  }
  await db.update(book).set({
    id,
    title,
    cover: cover === void 0 ? "" : cover,
    tags: tags === void 0 ? [] : tags.split(",") || [],
    description,
    published,
    allow_comments
  }).where(and(eq(book.id, id), eq(book.author_id, user.id)));
  return {
    success: true
  };
};
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
function BookCard(bookprops) {
  const { title, author, cover, src, tags } = bookprops;
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-full", children: /* @__PURE__ */ jsxs(
    Link,
    {
      className: `flex flex-col lg:min-w-48 min-w-8 p-4 border-gray-200 border *:m-0
				md:flex-row md:w-96 md:h-48 w-32 h-48 md:*:p-2 
				shadow-slate-300 hover:shadow-xl hover:border-0`,
      to: src,
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-2/3 w-full min-w-24 md:w-1/2 md:h-full", children: /* @__PURE__ */ jsx(
          "img",
          {
            className: "h-full w-full object-cover overflow-hidden ",
            src: cover,
            alt: `${title} Cover`
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-rows-4 md:w-1/2", children: [
          /* @__PURE__ */ jsx("p", { children: title }),
          /* @__PURE__ */ jsx("p", { children: author }),
          /* @__PURE__ */ jsx("div", { className: "h-min grid-rows-subgrid row-span-2 flex flex-wrap overflow-hidden", children: tags == null ? void 0 : tags.slice(0, 6).map((tag, index) => {
            return /* @__PURE__ */ jsx(
              "p",
              {
                className: "border  border-gray-200",
                children: tag
              },
              index
            );
          }) })
        ] })
      ]
    }
  ) });
}
function BookShelf({ books }) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2", children: books.map((book2, index) => {
    return /* @__PURE__ */ jsx(
      BookCard,
      {
        title: book2.title,
        author: book2.author,
        src: book2.src,
        tags: book2.tags,
        cover: book2.cover
      },
      index
    );
  }) });
}
const loader$a = async ({ params }) => {
  const id = parseInt(params.id || "");
  const user = await db.select().from(account$1).where(eq(account$1.id, id));
  if (user.length === 0)
    return redirect("/404");
  const books = (await db.select({
    id: book.id,
    title: book.title,
    cover: book.cover,
    tags: book.tags,
    author: account$1.name
  }).from(book).innerJoin(account$1, eq(account$1.id, id)).where(eq(book.author_id, id))).map((e) => {
    return {
      src: `/book/${e.id}`,
      author: e.author,
      title: e.title,
      cover: e.cover,
      tags: e.tags
    };
  });
  return { user: user[0], books };
};
function User() {
  const { user, books } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center m-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center justify-center", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: user.link_avatar || "",
        alt: "avatar",
        className: "w-16 h-16 rounded-full shadow-lg object-cover"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl", children: user.name }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex m-4 flex-col", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl", children: "作品:" }),
      /* @__PURE__ */ jsx(BookShelf, { books })
    ] })
  ] });
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: User,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
let loader$9 = async ({ request }) => {
  const logindata = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });
  if (logindata) {
    return logindata;
  }
  return redirect("/login");
};
const meta$3 = ({ data }) => {
  return [
    {
      //@ts-ignore
      title: `Laganto -  ${(data == null ? void 0 : data.displayName) || ""}`
    }
  ];
};
function Account() {
  const data = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "", children: [
    /* @__PURE__ */ jsx("div", { className: "w-full flex items-center justify-center m-10 ml-0", children: /* @__PURE__ */ jsx(
      "img",
      {
        alt: "avatar_img",
        src: data.photoURL,
        className: "object-cover w-16 h-16 rounded-full shadow-xl"
      }
    ) }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsx("div", { className: "grid xl:grid-cols-4 md:grid-cols-2", children: [
      {
        name: "Name",
        value: data.displayName
      },
      {
        name: "Email",
        value: data.email
      },
      {
        name: "Linked Accounts",
        value: data.link_account
      },
      {
        name: "Permissions",
        value: data.permissions
      }
    ].map((data2, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "w-auto m-4 flex flex-col",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center *:m-2", children: [
            /* @__PURE__ */ jsx("p", { children: data2.name }),
            /* @__PURE__ */ jsx("p", { children: !Array.isArray(data2.value) ? data2.value : data2.value.map((item, index2) => {
              return /* @__PURE__ */ jsx(
                "p",
                {
                  className: "bg-green-200 rounded-lg pl-1 pr-1",
                  children: item
                },
                index2
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx("hr", { className: "" })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ jsx("div", { className: "flex w-full justify-center *:pl-2 *:pr-2 *:rounded-lg", children: /* @__PURE__ */ jsx(
      Form,
      {
        action: "/auth/logout",
        className: "bg-red-400 ",
        children: /* @__PURE__ */ jsx("button", { children: "Logout" })
      }
    ) })
  ] });
}
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Account,
  loader: loader$9,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$8 = async ({
  request
}) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });
  if (!user) {
    return {};
  }
  const history_books = await db.select().from(history$1).where(eq(history$1.user_id, user.id)).orderBy(asc(history$1.created_at));
  const history_book_ids = history_books.map((history2) => history2.book_id);
  if (history_book_ids.length === 0) {
    return {};
  }
  const books = await db.select().from(history$1).innerJoin(book, inArray(book.id, history_book_ids)).where(eq(history$1.user_id, user.id));
  const result = books.map((data) => {
    var _a, _b;
    const book2 = data.book;
    return {
      cover: book2.cover,
      title: book2.title,
      tags: book2.tags,
      src: `/book/reader/${book2.id}?chapter=${((_a = history_books.find((history2) => history2.book_id === book2.id)) == null ? void 0 : _a.chapter) || 0}&page=${((_b = history_books.find((history2) => history2.book_id === book2.id)) == null ? void 0 : _b.page) || 0}`
    };
  });
  return {
    books: result
  };
};
const meta$2 = () => {
  return [{ title: "Laganto - Book History" }];
};
function BookHistory() {
  const { books } = useLoaderData();
  if (!books) {
    return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "shadow-lg shadow-slate-300 p-4 rounded-md flex flex-row", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          className: "object-scale-down h-32 w-32",
          src: sad,
          alt: "Sad Face"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center ml-8 text-lg", children: /* @__PURE__ */ jsx("p", { children: "No Books Found" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(BookShelf, { books }) });
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BookHistory,
  loader: loader$8,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$7 = async () => {
  return redirect("/404");
};
const action$1 = async ({ request }) => {
  const body = await request.json();
  const { chapter: chapter2, page, bookid } = body;
  if (chapter2 === void 0 || page === void 0 || bookid == void 0 || isNaN(parseInt(chapter2)) || isNaN(parseInt(page)) || isNaN(parseInt(bookid)) || parseInt(chapter2) < 0 || parseInt(page) < 0) {
    return {
      status: 400,
      message: "Invalid request"
    };
  }
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return {
      status: 401,
      message: "Unauthorized"
    };
  }
  await db.insert(history$1).values({
    user_id: user.id,
    book_id: parseInt(bookid),
    chapter: parseInt(chapter2),
    page: parseInt(page)
  }).onConflictDoUpdate({
    target: [history$1.user_id, history$1.book_id],
    set: {
      chapter: parseInt(chapter2 || "0"),
      page: parseInt(page || "0"),
      created_at: /* @__PURE__ */ new Date()
    }
  });
  return {
    status: 200,
    message: "Success"
  };
};
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
let loader$6 = async ({ request }) => {
  return await authenticator.logout(request, { redirectTo: "/" });
};
let action = async ({ request, params }) => {
  return await authenticator.logout(request, { redirectTo: "/" });
};
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const meta$1 = () => {
  return [
    { title: "Laganto - Home" }
  ];
};
const loader$5 = async ({ request }) => {
  return {
    bookdata: (await db.select().from(book).innerJoin(account$1, eq(book.author_id, account$1.id)).where(eq(book.published, true))).map(
      (data) => Object.assign(data.book, { author_name: data.account.name || "" })
    )
  };
};
function Index$1() {
  const { bookdata } = useLoaderData();
  const data = [
    {
      title: "Recently Read",
      books: [...bookdata]
    },
    {
      title: "Recently Added",
      books: []
    },
    {
      title: "Recommended",
      books: []
    },
    {
      title: "Popular",
      books: []
    }
  ];
  return /* @__PURE__ */ jsx("div", { className: "overflow-y-scroll m-2 lg:m-4", children: data.map((item, index) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: " justify-center",
      children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl", children: item.title }),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsx("div", { className: "h-60 bg-gray-400 mt-2 lg:m-2 flex fle-row overflow-hidden", children: item.books.map((e, i) => {
          return /* @__PURE__ */ jsx(
            BookCard,
            {
              title: e.title || "",
              tags: e.tags || [],
              cover: e.cover || "",
              author: e.author_name,
              src: `/book/${e.id}`
            },
            i * index * 10
          );
        }) })
      ]
    },
    index
  )) });
}
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$1,
  loader: loader$5,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function test() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-full h-[100vh] ", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-700", children: [
      /* @__PURE__ */ jsx("div", { className: "" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-row", children: [
        {
          "name": "主頁",
          "src": "/"
        },
        {
          name: "關於",
          src: "/about"
        },
        {
          name: "使用者條款",
          src: "/terms"
        },
        {
          name: "聯絡我們",
          src: "/contact"
        }
      ].map((item, index) => {
        return /* @__PURE__ */ jsx(
          Link,
          {
            className: "p-4 text-white",
            to: item.src,
            children: item.name
          },
          index * 10
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "w-full h-[50vh] bg-blue-500 grid-rows-subgrid row-span-4 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-white", children: "Laganto" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-row m-4", children: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/home",
          className: "bg-green-200 p-4 rounded-xl",
          children: "Try it now"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-black" })
  ] });
}
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: test
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ params }) => {
  const content = [
    {
      type: "about",
      title: "關於",
      content: [
        {
          title: "關於",
          content: "這是一個全端閱讀器的計畫，慢慢做ww"
        }
      ]
    },
    {
      type: "terms",
      title: "使用條款",
      content: [
        {
          title: "使用者條款",
          content: ["平台保留所有資料使用   、 編輯 、 分發等權利"]
        }
      ]
    },
    {
      type: "contact",
      title: "聯絡我們",
      content: [
        {
          title: "Pikacnu",
          content: ["DC : Pikacnu", "Email : pika@pikacnu.com"]
        }
      ]
    }
  ];
  if (params.type)
    return { content: content.find((e) => e.type === params.type) };
  return redirect("/404");
};
function type() {
  const { content } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-full h-[100vh] ", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-700", children: [
      /* @__PURE__ */ jsx("div", { className: "" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-row", children: [
        {
          name: "主頁",
          src: "/"
        },
        {
          name: "關於",
          src: "/about"
        },
        {
          name: "使用者條款",
          src: "/terms"
        },
        {
          name: "聯絡我們",
          src: "/contact"
        }
      ].map((item, index) => {
        return /* @__PURE__ */ jsx(
          Link,
          {
            className: "p-4 text-white",
            to: item.src,
            children: item.name
          },
          index * 10
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: " flex flex-col items-center w-full h-full", children: content == null ? void 0 : content.content.map((e, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex flex-col text-white items-center bg-gray-500 w-full h-full",
        children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg w-full bg-slate-400 text-black text-center p-8", children: e.title }),
          Array.isArray(e.content) ? /* @__PURE__ */ jsx("ul", { className: " list-decimal m-4", children: e.content.map((item, index2) => /* @__PURE__ */ jsx(
            "li",
            {
              className: "",
              children: item
            },
            index2
          )) }) : /* @__PURE__ */ jsx("p", { children: e.content })
        ]
      },
      index
    )) })
  ] });
}
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: type,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const discord = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%20-28.5%20256%20256'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20preserveAspectRatio='xMidYMid'%3e%3cg%3e%3cpath%20d='M216.856339,16.5966031%20C200.285002,8.84328665%20182.566144,3.2084988%20164.041564,0%20C161.766523,4.11318106%20159.108624,9.64549908%20157.276099,14.0464379%20C137.583995,11.0849896%20118.072967,11.0849896%2098.7430163,14.0464379%20C96.9108417,9.64549908%2094.1925838,4.11318106%2091.8971895,0%20C73.3526068,3.2084988%2055.6133949,8.86399117%2039.0420583,16.6376612%20C5.61752293,67.146514%20-3.4433191,116.400813%201.08711069,164.955721%20C23.2560196,181.510915%2044.7403634,191.567697%2065.8621325,198.148576%20C71.0772151,190.971126%2075.7283628,183.341335%2079.7352139,175.300261%20C72.104019,172.400575%2064.7949724,168.822202%2057.8887866,164.667963%20C59.7209612,163.310589%2061.5131304,161.891452%2063.2445898,160.431257%20C105.36741,180.133187%20151.134928,180.133187%20192.754523,160.431257%20C194.506336,161.891452%20196.298154,163.310589%20198.110326,164.667963%20C191.183787,168.842556%20183.854737,172.420929%20176.223542,175.320965%20C180.230393,183.341335%20184.861538,190.991831%20190.096624,198.16893%20C211.238746,191.588051%20232.743023,181.531619%20254.911949,164.955721%20C260.227747,108.668201%20245.831087,59.8662432%20216.856339,16.5966031%20Z%20M85.4738752,135.09489%20C72.8290281,135.09489%2062.4592217,123.290155%2062.4592217,108.914901%20C62.4592217,94.5396472%2072.607595,82.7145587%2085.4738752,82.7145587%20C98.3405064,82.7145587%20108.709962,94.5189427%20108.488529,108.914901%20C108.508531,123.290155%2098.3405064,135.09489%2085.4738752,135.09489%20Z%20M170.525237,135.09489%20C157.88039,135.09489%20147.510584,123.290155%20147.510584,108.914901%20C147.510584,94.5396472%20157.658606,82.7145587%20170.525237,82.7145587%20C183.391518,82.7145587%20193.761324,94.5189427%20193.539891,108.914901%20C193.539891,123.290155%20183.391518,135.09489%20170.525237,135.09489%20Z'%20fill='%235865F2'%20fill-rule='nonzero'%3e%3c/path%3e%3c/g%3e%3c/svg%3e";
const github = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2020%2020'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3ctitle%3egithub%20[%23142]%3c/title%3e%3cdesc%3eCreated%20with%20Sketch.%3c/desc%3e%3cdefs%3e%3c/defs%3e%3cg%20id='Page-1'%20stroke='none'%20stroke-width='1'%20fill='none'%20fill-rule='evenodd'%3e%3cg%20id='Dribbble-Light-Preview'%20transform='translate(-140.000000,%20-7559.000000)'%20fill='%23000000'%3e%3cg%20id='icons'%20transform='translate(56.000000,%20160.000000)'%3e%3cpath%20d='M94,7399%20C99.523,7399%20104,7403.59%20104,7409.253%20C104,7413.782%20101.138,7417.624%2097.167,7418.981%20C96.66,7419.082%2096.48,7418.762%2096.48,7418.489%20C96.48,7418.151%2096.492,7417.047%2096.492,7415.675%20C96.492,7414.719%2096.172,7414.095%2095.813,7413.777%20C98.04,7413.523%20100.38,7412.656%20100.38,7408.718%20C100.38,7407.598%2099.992,7406.684%2099.35,7405.966%20C99.454,7405.707%2099.797,7404.664%2099.252,7403.252%20C99.252,7403.252%2098.414,7402.977%2096.505,7404.303%20C95.706,7404.076%2094.85,7403.962%2094,7403.958%20C93.15,7403.962%2092.295,7404.076%2091.497,7404.303%20C89.586,7402.977%2088.746,7403.252%2088.746,7403.252%20C88.203,7404.664%2088.546,7405.707%2088.649,7405.966%20C88.01,7406.684%2087.619,7407.598%2087.619,7408.718%20C87.619,7412.646%2089.954,7413.526%2092.175,7413.785%20C91.889,7414.041%2091.63,7414.493%2091.54,7415.156%20C90.97,7415.418%2089.522,7415.871%2088.63,7414.304%20C88.63,7414.304%2088.101,7413.319%2087.097,7413.247%20C87.097,7413.247%2086.122,7413.234%2087.029,7413.87%20C87.029,7413.87%2087.684,7414.185%2088.139,7415.37%20C88.139,7415.37%2088.726,7417.2%2091.508,7416.58%20C91.513,7417.437%2091.522,7418.245%2091.522,7418.489%20C91.522,7418.76%2091.338,7419.077%2090.839,7418.982%20C86.865,7417.627%2084,7413.783%2084,7409.253%20C84,7403.59%2088.478,7399%2094,7399'%20id='github-[%23142]'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e";
const google = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='-0.5%200%2048%2048'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3ctitle%3eGoogle-color%3c/title%3e%3cdesc%3eCreated%20with%20Sketch.%3c/desc%3e%3cdefs%3e%3c/defs%3e%3cg%20id='Icons'%20stroke='none'%20stroke-width='1'%20fill='none'%20fill-rule='evenodd'%3e%3cg%20id='Color-'%20transform='translate(-401.000000,%20-860.000000)'%3e%3cg%20id='Google'%20transform='translate(401.000000,%20860.000000)'%3e%3cpath%20d='M9.82727273,24%20C9.82727273,22.4757333%2010.0804318,21.0144%2010.5322727,19.6437333%20L2.62345455,13.6042667%20C1.08206818,16.7338667%200.213636364,20.2602667%200.213636364,24%20C0.213636364,27.7365333%201.081,31.2608%202.62025,34.3882667%20L10.5247955,28.3370667%20C10.0772273,26.9728%209.82727273,25.5168%209.82727273,24'%20id='Fill-1'%20fill='%23FBBC05'%3e%3c/path%3e%3cpath%20d='M23.7136364,10.1333333%20C27.025,10.1333333%2030.0159091,11.3066667%2032.3659091,13.2266667%20L39.2022727,6.4%20C35.0363636,2.77333333%2029.6954545,0.533333333%2023.7136364,0.533333333%20C14.4268636,0.533333333%206.44540909,5.84426667%202.62345455,13.6042667%20L10.5322727,19.6437333%20C12.3545909,14.112%2017.5491591,10.1333333%2023.7136364,10.1333333'%20id='Fill-2'%20fill='%23EB4335'%3e%3c/path%3e%3cpath%20d='M23.7136364,37.8666667%20C17.5491591,37.8666667%2012.3545909,33.888%2010.5322727,28.3562667%20L2.62345455,34.3946667%20C6.44540909,42.1557333%2014.4268636,47.4666667%2023.7136364,47.4666667%20C29.4455,47.4666667%2034.9177955,45.4314667%2039.0249545,41.6181333%20L31.5177727,35.8144%20C29.3995682,37.1488%2026.7323182,37.8666667%2023.7136364,37.8666667'%20id='Fill-3'%20fill='%2334A853'%3e%3c/path%3e%3cpath%20d='M46.1454545,24%20C46.1454545,22.6133333%2045.9318182,21.12%2045.6113636,19.7333333%20L23.7136364,19.7333333%20L23.7136364,28.8%20L36.3181818,28.8%20C35.6879545,31.8912%2033.9724545,34.2677333%2031.5177727,35.8144%20L39.0249545,41.6181333%20C43.3393409,37.6138667%2046.1454545,31.6490667%2046.1454545,24'%20id='Fill-4'%20fill='%234285F4'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e";
const icons = {
  [SocialsProvider.DISCORD]: discord,
  [SocialsProvider.GITHUB]: github,
  [SocialsProvider.GOOGLE]: google,
  [SocialsProvider.TWITTER]: "",
  [SocialsProvider.FACEBOOK]: "",
  [SocialsProvider.MICROSOFT]: ""
};
const SocialButton = ({ provider, label }) => /* @__PURE__ */ jsx("div", { className: "transition-all hover:bg-slate-200 p-2 rounded", children: /* @__PURE__ */ jsx(
  Form,
  {
    action: `/auth/${provider}`,
    method: "post",
    children: /* @__PURE__ */ jsxs("button", { className: " flex flex-row items-center justify-center space-x-4", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          className: "h-8",
          src: icons[provider],
          alt: ""
        }
      ),
      " ",
      label
    ] })
  }
) });
const loader$3 = async ({ request }) => {
  const logindata = await authenticator.isAuthenticated(request, {
    successRedirect: "/home"
  });
  return logindata;
};
function Login() {
  return /* @__PURE__ */ jsx("div", { className: "h-screen flex justify-center items-center bg-zinc-300", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col *:m-4  items-center justify-center relative w-2/3 h-2/3 shadow-xl bg-white rounded-xl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Login" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        SocialButton,
        {
          provider: SocialsProvider.DISCORD,
          label: "Login with Discord"
        }
      ),
      /* @__PURE__ */ jsx(
        SocialButton,
        {
          provider: SocialsProvider.GITHUB,
          label: "Login with Github"
        }
      ),
      /* @__PURE__ */ jsx(
        SocialButton,
        {
          provider: SocialsProvider.GOOGLE,
          label: "Login with Google"
        }
      )
    ] })
  ] }) });
}
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ];
};
const loader$2 = async () => {
  return {
    pages: await db.select({
      content: chapter.content,
      title: chapter.title,
      pageIndex: chapter.chapter_id
    }).from(chapter).where(eq(chapter.book_id, 6))
  };
};
function Index() {
  const data = useLoaderData();
  console.log(data);
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full m-0", children: /* @__PURE__ */ jsx(
    Reader,
    {
      chapter: data
    }
  ) });
}
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader: loader$2,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const account = "data:image/svg+xml,%3csvg%20width='96'%20height='96'%20viewBox='0%200%2096%2096'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_58_19)'%3e%3cpath%20d='M48%208C25.92%208%208%2025.92%208%2048C8%2070.08%2025.92%2088%2048%2088C70.08%2088%2088%2070.08%2088%2048C88%2025.92%2070.08%208%2048%208ZM48%2024C55.72%2024%2062%2030.28%2062%2038C62%2045.72%2055.72%2052%2048%2052C40.28%2052%2034%2045.72%2034%2038C34%2030.28%2040.28%2024%2048%2024ZM48%2080C39.88%2080%2030.28%2076.72%2023.44%2068.48C30.2%2063.2%2038.72%2060%2048%2060C57.28%2060%2065.8%2063.2%2072.56%2068.48C65.72%2076.72%2056.12%2080%2048%2080Z'%20fill='black'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_58_19'%3e%3crect%20width='96'%20height='96'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const home = "data:image/svg+xml,%3csvg%20width='96'%20height='96'%20viewBox='0%200%2096%2096'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_58_2)'%3e%3cpath%20d='M40%2080V56H56V80H76V48H88L48%2012L8%2048H20V80H40Z'%20fill='black'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_58_2'%3e%3crect%20width='96'%20height='96'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const history = "data:image/svg+xml,%3csvg%20width='96'%20height='96'%20viewBox='0%200%2096%2096'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_58_5)'%3e%3cpath%20d='M52%2012C32.12%2012%2016%2028.12%2016%2048H4L19.56%2063.56L19.84%2064.12L36%2048H24C24%2032.52%2036.52%2020%2052%2020C67.48%2020%2080%2032.52%2080%2048C80%2063.48%2067.48%2076%2052%2076C44.28%2076%2037.28%2072.84%2032.24%2067.76L26.56%2073.44C33.08%2079.96%2042.04%2084%2052%2084C71.88%2084%2088%2067.88%2088%2048C88%2028.12%2071.88%2012%2052%2012ZM48%2032V52L65.12%2062.16L68%2057.32L54%2049V32H48Z'%20fill='black'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_58_5'%3e%3crect%20width='96'%20height='96'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const edit = "data:image/svg+xml,%3csvg%20width='96'%20height='96'%20viewBox='0%200%2096%2096'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_58_8)'%3e%3cpath%20d='M56%2079.52V88H64.48L85.16%2067.32L76.68%2058.84L56%2079.52Z'%20fill='black'/%3e%3cpath%20d='M80%2032L56%208H24C19.6%208%2016.04%2011.6%2016.04%2016L16%2080C16%2084.4%2019.56%2088%2023.96%2088H48V76.2L80%2044.2V32ZM52%2036V14L74%2036H52Z'%20fill='black'/%3e%3cpath%20d='M90.84%2056L88%2053.16C86.44%2051.6%2083.92%2051.6%2082.36%2053.16L79.52%2056L88%2064.48L90.84%2061.64C92.4%2060.08%2092.4%2057.56%2090.84%2056Z'%20fill='black'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_58_8'%3e%3crect%20width='96'%20height='96'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
let loader$1 = async ({ request }) => {
  const logindata = await authenticator.isAuthenticated(request);
  return { logindata };
};
function Layout() {
  const { logindata } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex w-full h-12 lg:h-14 bg-gray-600 align-middle justify-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "h-12 w-12 lg:h-14 lg:w-16 relative", children: [
        /* @__PURE__ */ jsx(Link, { to: "/account", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: (logindata == null ? void 0 : logindata.photoURL) || account,
            alt: "User Profile",
            className: "object-cover lg:h-14 lg:w-16"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "w-16" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 grid-rows-1 w-full h-full bg-blue-800 *:justify-center *:flex *:items-center opacity-0", children: /* @__PURE__ */ jsxs("div", { className: "bg-blue-200 grid-cols-subgrid col-span-6 *:m-2 lg:*:m-4", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search",
            className: "w-full"
          }
        ),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "",
            alt: "Search"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse lg:flex-row overflow-hidden h-[calc(100vh-3rem)] lg:h-[calc(100vh-3.5rem)]", children: [
      /* @__PURE__ */ jsx("div", { className: "flex lg:flex-col overflow-hidden space-between align-middle justify-center flex-row *:m-2 lg:h-[calc(100vh-3.5rem)] h-16 w-full lg:w-16 bg-gray-500", children: (logindata ? [
        {
          name: "Home",
          src: "/home",
          icon: home
        },
        {
          name: "History",
          src: "/history",
          icon: history
        },
        {
          name: "Edit",
          src: "/edit",
          icon: edit
        },
        {
          name: "account",
          src: "/account",
          icon: account
        }
      ] : [
        {
          name: "Home",
          src: "/home",
          icon: home
        },
        {
          name: "Login",
          src: "/account",
          icon: account
        }
      ]).map((item, index) => {
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.src,
            className: "flex flex-col items-center justify-center hover:bg-gray-400 hover:shadow-lg shadow-black rounded-md *:rounded-md select-none w-12",
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.icon,
                  alt: "ICON",
                  className: "object-cover h-8 w-8 lg:h-12 lg:w-12"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: item.name })
            ]
          },
          index
        );
      }) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-full h-full lg:w-[calc(100%-4rem)] overflow-y-auto overflow-x-hidden",
          children: /* @__PURE__ */ jsx(Outlet, {})
        }
      )
    ] })
  ] });
}
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Layout,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function loader({ request }) {
  return authenticator.isAuthenticated(request, {
    failureRedirect: "/",
    successRedirect: "/home"
  });
}
function NotFound() {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl", children: "404 Not Found" }) });
}
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BYjeBx54.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-uMfQI5fQ.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/auth.$provider.callback": { "id": "routes/auth.$provider.callback", "parentId": "routes/auth.$provider", "path": "callback", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._provider.callback-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.book.content.save": { "id": "routes/api.book.content.save", "parentId": "root", "path": "api/book/content/save", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.book.content.save-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/book.reader.$bookid": { "id": "routes/book.reader.$bookid", "parentId": "root", "path": "book/reader/:bookid", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/book.reader._bookid-B-Ez3sBv.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/reader-DPm4sgwu.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/_app.editor.$bookid": { "id": "routes/_app.editor.$bookid", "parentId": "routes/_app", "path": "editor/:bookid", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.editor._bookid-M-gDhr26.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/v4-DJtXzT8a.js", "/assets/components-D0pOR1-x.js"], "css": ["/assets/_app.editor-BEDsrkZb.css"] }, "routes/_app.book.$bookid": { "id": "routes/_app.book.$bookid", "parentId": "routes/_app", "path": "book/:bookid", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.book._bookid-7ZxRp28P.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js", "/assets/bookinfo-XVuh1142.js", "/assets/sad-fJfOCAI2.js"], "css": [] }, "routes/_app.edit.$bookid": { "id": "routes/_app.edit.$bookid", "parentId": "routes/_app", "path": "edit/:bookid", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.edit._bookid-CgiKPoGY.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js", "/assets/bookinfo-XVuh1142.js"], "css": [] }, "routes/_app.edit._index": { "id": "routes/_app.edit._index", "parentId": "routes/_app", "path": "edit", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.edit._index-C67Mhb2x.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/auth.$provider": { "id": "routes/auth.$provider", "parentId": "root", "path": "auth/:provider", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._provider-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_app.book.edit": { "id": "routes/_app.book.edit", "parentId": "routes/_app", "path": "book/edit", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.book.edit-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.book.edit": { "id": "routes/api.book.edit", "parentId": "root", "path": "api/book/edit", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.book.edit-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.book.save": { "id": "routes/api.book.save", "parentId": "root", "path": "api/book/save", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.book.save-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_app.user.$id": { "id": "routes/_app.user.$id", "parentId": "routes/_app", "path": "user/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.user._id-fXtBkQpq.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js", "/assets/bookcard-CTN9fDWw.js", "/assets/bookshelf-Ov2VH4wf.js"], "css": [] }, "routes/_app.account": { "id": "routes/_app.account", "parentId": "routes/_app", "path": "account", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.account-BsurPwwM.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/_app.history": { "id": "routes/_app.history", "parentId": "routes/_app", "path": "history", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.history-B-Ce_-cP.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js", "/assets/bookcard-CTN9fDWw.js", "/assets/bookshelf-Ov2VH4wf.js", "/assets/sad-fJfOCAI2.js"], "css": [] }, "routes/api.history": { "id": "routes/api.history", "parentId": "root", "path": "api/history", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.history-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.logout": { "id": "routes/auth.logout", "parentId": "root", "path": "auth/logout", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.logout-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_app.home": { "id": "routes/_app.home", "parentId": "routes/_app", "path": "home", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app.home-BPKPy70a.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js", "/assets/bookcard-CTN9fDWw.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-DZyJhi75.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/$type": { "id": "routes/$type", "parentId": "root", "path": ":type", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_type-BtvSxKgA.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/login-4j1uXSgi.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/v4-DJtXzT8a.js"], "css": [] }, "routes/test": { "id": "routes/test", "parentId": "root", "path": "test", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/test-BFcVeYk3.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/reader-DPm4sgwu.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/_app": { "id": "routes/_app", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_app-BH7Ie2YG.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js", "/assets/single-fetch-BCsd51Q2.js", "/assets/components-D0pOR1-x.js"], "css": [] }, "routes/404": { "id": "routes/404", "parentId": "root", "path": "404", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/404-OCEge2CB.js", "imports": ["/assets/jsx-runtime-C2JdrU5W.js"], "css": [] } }, "url": "/assets/manifest-593ea98f.js", "version": "593ea98f" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/auth.$provider.callback": {
    id: "routes/auth.$provider.callback",
    parentId: "routes/auth.$provider",
    path: "callback",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/api.book.content.save": {
    id: "routes/api.book.content.save",
    parentId: "root",
    path: "api/book/content/save",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/book.reader.$bookid": {
    id: "routes/book.reader.$bookid",
    parentId: "root",
    path: "book/reader/:bookid",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/_app.editor.$bookid": {
    id: "routes/_app.editor.$bookid",
    parentId: "routes/_app",
    path: "editor/:bookid",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_app.book.$bookid": {
    id: "routes/_app.book.$bookid",
    parentId: "routes/_app",
    path: "book/:bookid",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_app.edit.$bookid": {
    id: "routes/_app.edit.$bookid",
    parentId: "routes/_app",
    path: "edit/:bookid",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/_app.edit._index": {
    id: "routes/_app.edit._index",
    parentId: "routes/_app",
    path: "edit",
    index: true,
    caseSensitive: void 0,
    module: route7
  },
  "routes/auth.$provider": {
    id: "routes/auth.$provider",
    parentId: "root",
    path: "auth/:provider",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/_app.book.edit": {
    id: "routes/_app.book.edit",
    parentId: "routes/_app",
    path: "book/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/api.book.edit": {
    id: "routes/api.book.edit",
    parentId: "root",
    path: "api/book/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/api.book.save": {
    id: "routes/api.book.save",
    parentId: "root",
    path: "api/book/save",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/_app.user.$id": {
    id: "routes/_app.user.$id",
    parentId: "routes/_app",
    path: "user/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/_app.account": {
    id: "routes/_app.account",
    parentId: "routes/_app",
    path: "account",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/_app.history": {
    id: "routes/_app.history",
    parentId: "routes/_app",
    path: "history",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/api.history": {
    id: "routes/api.history",
    parentId: "root",
    path: "api/history",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/auth.logout": {
    id: "routes/auth.logout",
    parentId: "root",
    path: "auth/logout",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/_app.home": {
    id: "routes/_app.home",
    parentId: "routes/_app",
    path: "home",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route18
  },
  "routes/$type": {
    id: "routes/$type",
    parentId: "root",
    path: ":type",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "routes/test": {
    id: "routes/test",
    parentId: "root",
    path: "test",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "routes/_app": {
    id: "routes/_app",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "routes/404": {
    id: "routes/404",
    parentId: "root",
    path: "404",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
