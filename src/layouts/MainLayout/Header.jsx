import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CircleUserRound,
  Activity,
  LogOut,
  ChevronDown,
  AlertTriangle,
  MapPin,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "hawkvision_read_notifications"
      );
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const readNotificationIdsRef = useRef(readNotificationIds);

  useEffect(() => {
    readNotificationIdsRef.current = readNotificationIds;
  }, [readNotificationIds]);

  // Broadcast notification dropdown visibility so dashboard
  // overlays can avoid covering the notification panel.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(
        "hawkvision:notifications-visibility",
        {
          detail: {
            open: showNotifications,
          },
        }
      )
    );
  }, [showNotifications]);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/alerts`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const result = await response.json();

      if (
        result.success &&
        Array.isArray(result.data)
      ) {
        // Notifications only show unresolved alerts.
        const activeAlerts = result.data.filter((alert) => {
          const status = String(
            alert.status || "ACTIVE"
          ).toUpperCase();

          return status !== "RESOLVED";
        });

        // Hide alerts that the user has already read.
        const unreadAlerts = activeAlerts.filter((alert) => {
          const id = String(
            alert.id || alert._id || ""
          );

          return (
            id &&
            !readNotificationIdsRef.current.includes(id)
          );
        });

        setNotifications(unreadAlerts);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );

      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // =====================================================
  // INITIAL FETCH + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Persist which notifications have already been read.
  useEffect(() => {
    try {
      const cleanedIds =
        readNotificationIds.length > 500
          ? readNotificationIds.slice(-300)
          : readNotificationIds;

      localStorage.setItem(
        "hawkvision_read_notifications",
        JSON.stringify(cleanedIds)
      );

      if (cleanedIds.length !== readNotificationIds.length) {
        setReadNotificationIds(cleanedIds);
      }
    } catch (error) {
      console.error(
        "Notification read-state save error:",
        error
      );
    }
  }, [readNotificationIds]);

  // =====================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =====================================================
  // OPEN SELECTED ALERT
  // =====================================================

  const handleNotificationClick = (alert) => {
    const id = String(
      alert?.id || alert?._id || ""
    );

    if (id) {
      setReadNotificationIds((prev) => {
        if (prev.includes(id)) {
          return prev;
        }

        return [...prev, id];
      });

      setNotifications((prev) =>
        prev.filter(
          (item) =>
            String(
              item?.id || item?._id || ""
            ) !== id
        )
      );
    }

    setShowNotifications(false);

    // Selected notification opens Alerts page
    navigate("/alerts");
  };

  const handleMarkAllRead = () => {
    const ids = notifications
      .map((alert) =>
        String(
          alert?.id || alert?._id || ""
        )
      )
      .filter(Boolean);

    if (ids.length > 0) {
      setReadNotificationIds((prev) => [
        ...new Set([...prev, ...ids]),
      ]);
    }

    setNotifications([]);
  };

  // =====================================================
  // TOTAL NOTIFICATION COUNT
  // =====================================================
  // IMPORTANT:
  // Every notification returned by /api/alerts
  // is counted.
  //
  // Example:
  // 2 alerts returned = badge shows 2
  // =====================================================

  const notificationCount =
    notifications.length;

  // =====================================================
  // SHOW LATEST 5 NOTIFICATIONS
  // =====================================================

  const latestNotifications =
    notifications.slice(0, 5);

  // =====================================================
  // SEVERITY STYLES
  // =====================================================

  const getSeverityStyles = (severity) => {
    const value = String(
      severity || ""
    ).toUpperCase();

    if (value === "CRITICAL") {
      return {
        text: "text-[#EF3340]",
        bg: "bg-[#EF3340]/10",
        border: "border-[#EF3340]/30",
      };
    }

    if (value === "HIGH") {
      return {
        text: "text-[#F59E0B]",
        bg: "bg-[#F59E0B]/10",
        border: "border-[#F59E0B]/30",
      };
    }

    if (value === "MEDIUM") {
      return {
        text: "text-[#3B82F6]",
        bg: "bg-[#3B82F6]/10",
        border: "border-[#3B82F6]/30",
      };
    }

    return {
      text: "text-[#22C55E]",
      bg: "bg-[#22C55E]/10",
      border: "border-[#22C55E]/30",
    };
  };

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "";

    const alertDate = new Date(date);

    if (Number.isNaN(alertDate.getTime())) {
      return "";
    }

    const now = new Date();

    const diff = Math.floor(
      (now.getTime() -
        alertDate.getTime()) /
        1000
    );

    if (diff < 60) {
      return "Just now";
    }

    if (diff < 3600) {
      return `${Math.floor(
        diff / 60
      )} min ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(
        diff / 3600
      )} hr ago`;
    }

    if (diff < 604800) {
      return `${Math.floor(
        diff / 86400
      )} days ago`;
    }

    return alertDate.toLocaleDateString();
  };

  return (
    <header
      className="
        h-20
        border-b
        border-[#1D304D]
        bg-[#080D1A]
        px-6
        lg:px-8
        flex
        items-center
        justify-between
        relative
        overflow-visible
        z-40
      "
    >

      {/* =====================================================
          TOP ACCENT
      ===================================================== */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#243A59]
          to-transparent
        "
      />

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div>
        <div className="flex items-center gap-2">

          <span
            className="
              w-1.5
              h-1.5
              rounded-full
              bg-[#EF3340]
              shadow-[0_0_8px_rgba(239,51,64,0.8)]
            "
          />

          <p
            className="
              text-[10px]
              tracking-[0.2em]
              text-[#EF3340]
              font-semibold
            "
          >
            PAKISTAN · NATIONAL OPERATIONS
          </p>

        </div>

        <h2
          className="
            text-lg
            font-semibold
            mt-1
            text-[#F8FAFC]
            tracking-tight
          "
        >
          Disaster Control Center
        </h2>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="flex items-center gap-3">

        {/* =================================================
            SYSTEM ONLINE
        ================================================= */}

        <div
          className="
            hidden
            sm:flex
            items-center
            gap-2.5
            px-3.5
            py-2
            rounded-lg
            bg-[#0B1425]
            border
            border-[#1D304D]
          "
        >

          <span className="relative flex h-2 w-2">

            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                rounded-full
                bg-[#22C55E]
                opacity-60
                animate-ping
              "
            />

            <span
              className="
                relative
                inline-flex
                h-2
                w-2
                rounded-full
                bg-[#22C55E]
              "
            />

          </span>

          <span className="text-xs text-[#AFC1DC]">
            System Online
          </span>

        </div>

        {/* =================================================
            RESPONSE NETWORK
        ================================================= */}

        <div
          className="
            hidden
            lg:flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            border
            border-[#1D304D]
            bg-[#0B1425]
          "
        >

          <Activity
            size={14}
            className="text-[#22C55E]"
          />

          <span
            className="
              text-[11px]
              text-[#7186A8]
            "
          >
            Response Network
          </span>

          <span
            className="
              text-[11px]
              text-[#22C55E]
              font-semibold
            "
          >
            Connected
          </span>

        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="h-7 w-px bg-[#1D304D]" />

        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            onClick={() => {
              setShowNotifications(
                !showNotifications
              );

              setShowMenu(false);

              if (!showNotifications) {
                fetchNotifications();
              }
            }}
            className="
              relative
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-lg
              text-[#8FA4C7]
              hover:text-[#F8FAFC]
              hover:bg-[#111C31]
              transition-all
            "
            aria-label="Notifications"
          >

            <Bell size={19} />

            {/* =================================================
                NOTIFICATION BADGE
            ================================================= */}

            {notificationCount > 0 && (
              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  min-w-[17px]
                  h-[17px]
                  px-1
                  flex
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EF3340]
                  text-white
                  text-[9px]
                  font-bold
                  border-2
                  border-[#080D1A]
                  shadow-[0_0_8px_rgba(239,51,64,0.6)]
                "
              >
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}

          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-3
                w-[380px]
                max-w-[calc(100vw-2rem)]
                rounded-xl
                border
                border-[#1D304D]
                bg-[#0B1425]
                shadow-2xl
                overflow-hidden
                z-[100]
              "
            >

              {/* ===============================
                  DROPDOWN HEADER
              =============================== */}

              <div
                className="
                  px-4
                  py-3.5
                  border-b
                  border-[#1D304D]
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <div className="flex items-center gap-2">

                    <Bell
                      size={16}
                      className="text-[#3B82F6]"
                    />

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[#F8FAFC]
                      "
                    >
                      Notifications
                    </p>

                    {notificationCount > 0 && (
                      <span
                        className="
                          px-1.5
                          py-0.5
                          rounded-full
                          bg-[#EF3340]/10
                          text-[#EF3340]
                          text-[9px]
                          font-bold
                        "
                      >
                        {notificationCount}
                      </span>
                    )}

                  </div>

                  <p
                    className="
                      text-[10px]
                      text-[#7186A8]
                      mt-1
                    "
                  >
                    <span>Latest emergency events</span>

                    {notificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="
                          ml-3
                          text-[9px]
                          font-medium
                          text-[#3B82F6]
                          hover:text-[#60A5FA]
                          transition-colors
                        "
                      >
                        Mark all read
                      </button>
                    )}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  className="
                    w-7
                    h-7
                    rounded-md
                    flex
                    items-center
                    justify-center
                    text-[#7186A8]
                    hover:text-white
                    hover:bg-[#111C31]
                  "
                  aria-label="Close notifications"
                >
                  <X size={15} />
                </button>

              </div>

              {/* ===============================
                  NOTIFICATION CONTENT
              =============================== */}

              <div className="max-h-[390px] overflow-y-auto">

                {notificationLoading ? (

                  <div
                    className="
                      px-4
                      py-8
                      text-center
                    "
                  >

                    <div
                      className="
                        w-6
                        h-6
                        mx-auto
                        border-2
                        border-[#3B82F6]/30
                        border-t-[#3B82F6]
                        rounded-full
                        animate-spin
                      "
                    />

                    <p
                      className="
                        text-xs
                        text-[#7186A8]
                        mt-3
                      "
                    >
                      Loading notifications...
                    </p>

                  </div>

                ) : latestNotifications.length === 0 ? (

                  <div
                    className="
                      px-4
                      py-10
                      text-center
                    "
                  >

                    <Bell
                      size={28}
                      className="
                        mx-auto
                        text-[#3B82F6]/40
                      "
                    />

                    <p
                      className="
                        text-sm
                        text-[#AFC1DC]
                        mt-3
                      "
                    >
                      No new notifications
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-[#536987]
                        mt-1
                      "
                    >
                      You're all caught up.
                    </p>

                  </div>

                ) : (

                  latestNotifications.map(
                    (alert, index) => {

                      const styles =
                        getSeverityStyles(
                          alert.severity
                        );

                      return (
                        <button
                          key={
                            alert.id ||
                            alert._id ||
                            index
                          }
                          onClick={() =>
                            handleNotificationClick(
                              alert
                            )
                          }
                          className="
                            w-full
                            text-left
                            px-4
                            py-3.5
                            border-b
                            border-[#1D304D]
                            hover:bg-[#111C31]
                            transition-colors
                            group
                          "
                        >

                          <div className="flex gap-3">

                            {/* Alert Icon */}

                            <div
                              className={`
                                flex-shrink-0
                                w-9
                                h-9
                                rounded-lg
                                ${styles.bg}
                                border
                                ${styles.border}
                                flex
                                items-center
                                justify-center
                              `}
                            >

                              <AlertTriangle
                                size={16}
                                className={
                                  styles.text
                                }
                              />

                            </div>

                            {/* Alert Details */}

                            <div className="min-w-0 flex-1">

                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-2
                                "
                              >

                                <p
                                  className="
                                    text-xs
                                    font-semibold
                                    text-[#F1F5F9]
                                    group-hover:text-white
                                    line-clamp-2
                                  "
                                >
                                  {alert.title ||
                                    alert.message ||
                                    "Emergency Alert"}
                                </p>

                                <span
                                  className={`
                                    flex-shrink-0
                                    text-[8px]
                                    font-bold
                                    px-1.5
                                    py-0.5
                                    rounded
                                    border
                                    ${styles.bg}
                                    ${styles.border}
                                    ${styles.text}
                                  `}
                                >
                                  {String(
                                    alert.severity ||
                                      "INFO"
                                  ).toUpperCase()}
                                </span>

                              </div>

                              {/* Location */}

                              {alert.location && (
                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1
                                    mt-1.5
                                  "
                                >

                                  <MapPin
                                    size={11}
                                    className="
                                      text-[#7186A8]
                                    "
                                  />

                                  <span
                                    className="
                                      text-[10px]
                                      text-[#7186A8]
                                      truncate
                                    "
                                  >
                                    {typeof alert.location ===
                                    "object"
                                      ? alert.location
                                          ?.name ||
                                        "Unknown location"
                                      : alert.location}
                                  </span>

                                </div>
                              )}

                              {/* Time + Status */}

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  mt-1
                                "
                              >

                                <span
                                  className="
                                    text-[9px]
                                    text-[#536987]
                                  "
                                >
                                  {formatTime(
                                    alert.createdAt
                                  )}
                                </span>

                                <span className="text-[#344967]">
                                  •
                                </span>

                                <span
                                  className={`
                                    text-[9px]
                                    font-semibold
                                    ${
                                      String(
                                        alert.status ||
                                          ""
                                      ).toUpperCase() ===
                                      "ACTIVE"
                                        ? "text-[#22C55E]"
                                        : "text-[#7186A8]"
                                    }
                                  `}
                                >
                                  {String(
                                    alert.status ||
                                      "ACTIVE"
                                  ).toUpperCase()}
                                </span>

                              </div>

                            </div>

                            {/* Arrow */}

                            <div
                              className="
                                self-center
                                text-[#536987]
                                group-hover:text-[#3B82F6]
                                transition-colors
                              "
                            >
                              →
                            </div>

                          </div>

                        </button>
                      );
                    }
                  )

                )}

              </div>

              {/* ===============================
                  VIEW ALL ALERTS
              =============================== */}

              {latestNotifications.length > 0 && (
                <button
                  onClick={() => {
                    handleMarkAllRead();
                    setShowNotifications(false);
                    navigate("/alerts");
                  }}
                  className="
                    w-full
                    py-3
                    text-xs
                    font-medium
                    text-[#3B82F6]
                    hover:text-[#60A5FA]
                    hover:bg-[#111C31]
                    transition-colors
                  "
                >
                  View All Alerts
                </button>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="h-7 w-px bg-[#1D304D]" />

        {/* =================================================
            USER MENU
        ================================================= */}

        <div
          ref={userMenuRef}
          className="relative"
        >

          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setShowNotifications(false);
            }}
            className="
              flex
              items-center
              gap-2
              h-9
              px-2
              rounded-lg
              text-[#8FA4C7]
              hover:text-[#F8FAFC]
              hover:bg-[#111C31]
              transition-all
            "
          >

            <CircleUserRound size={21} />

            <span
              className="
                hidden
                sm:block
                text-sm
                max-w-[100px]
                truncate
              "
            >
              {user?.fullName || "User"}
            </span>

            <ChevronDown
              size={14}
              className={`
                transition-transform
                ${
                  showMenu
                    ? "rotate-180"
                    : ""
                }
              `}
            />

          </button>

          {/* USER DROPDOWN */}

          {showMenu && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-56
                rounded-lg
                border
                border-[#1D304D]
                bg-[#0B1425]
                shadow-xl
                overflow-hidden
                z-[100]
              "
            >

              <div
                className="
                  px-4
                  py-3
                  border-b
                  border-[#1D304D]
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-[#F8FAFC]
                    truncate
                  "
                >
                  {user?.fullName || "User"}
                </p>

                <p
                  className="
                    text-xs
                    text-[#8FA4C7]
                    truncate
                  "
                >
                  {user?.email || ""}
                </p>

              </div>

              <button
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-sm
                  text-[#EF3340]
                  hover:bg-[#111C31]
                  transition-colors
                "
              >

                <LogOut size={16} />

                Logout

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Header;